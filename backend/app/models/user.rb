# frozen_string_literal: true

class User < ApplicationRecord
  DEVELOPMENT_LOGIN_MARKER = "__DEV_USER__"
  DEMO_MAX_USER_ID = "demo_resident"

  has_many :sessions, dependent: :delete_all
  has_many :user_houses, dependent: :delete_all
  has_many :houses, through: :user_houses
  has_many :management_company_memberships, dependent: :delete_all
  has_many :management_companies, through: :management_company_memberships
  has_many :dispatch_house_selections, dependent: :delete_all
  has_many :created_cases,
    class_name: "Case",
    foreign_key: :creator_id,
    inverse_of: :creator,
    dependent: :restrict_with_exception
  has_many :case_confirmations, dependent: :restrict_with_exception
  has_many :case_events, foreign_key: :actor_user_id, inverse_of: :actor_user, dependent: :restrict_with_exception

  validates :max_user_id, presence: true

  def demo_account?
    max_user_id == DEMO_MAX_USER_ID
  end

  def dispatcher_access?
    dispatch_companies.exists?
  end

  def dispatch_companies
    return management_companies unless demo_account?
    return management_companies.none unless Rails.env.development?

    demo_houses = House.where(max_chat_id: House::DEMO_CHAT_IDS)
    real_houses = House.where.not(id: demo_houses.select(:id))
    real_cases = Case.where(house_id: real_houses.select(:id))
    company_id = demo_houses.find_by(max_chat_id: House::DEMO_CHAT_ID)&.management_company_id
    management_companies.where(id: company_id)
      .where.not(id: real_houses.where.not(management_company_id: nil).select(:management_company_id))
      .where.not(id: real_cases.where.not(management_company_id: nil).select(:management_company_id))
  end

  def join_demo_company!
    with_lock do
      company = House.demo.management_company
      management_company_memberships.find_or_create_by!(management_company: company)
    end
  end

  def house_access?(house)
    if demo_account?
      return false unless Rails.env.development? && house.demo?
      return true if house.max_chat_id == House::DEMO_CHAT_ID

      return user_houses.where.not(verified_at: nil).exists?(house: house)
    end
    return true if house.demo?
    return false if house.legacy_development?

    membership = user_houses.find_by(house: house)
    return false unless membership
    return true if membership.verified_at

    with_lock do
      membership = user_houses.find_by(house: house)
      return false unless membership
      return true if membership.verified_at

      UserHouse.verify!(user: self, house: house)
    end
  end
end
