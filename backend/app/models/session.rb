# frozen_string_literal: true

require "digest"
require "securerandom"

class Session < ApplicationRecord
  LIFETIME = 30.days
  COOKIE_NAME = "max_session"
  ACTIVE_ROLES = ["resident", "dispatcher"].freeze

  belongs_to :user
  belongs_to :house, optional: true
  validates :token_digest, :expires_at, presence: true
  validates :active_role, inclusion: { in: ACTIVE_ROLES }, allow_nil: true

  def available_roles
    roles = ["resident"]
    roles << "dispatcher" if user.dispatcher_access?
    roles
  end

  def select_house!(selected_house)
    user.with_lock do
      allowed = user.house_access?(selected_house)
      update!(house: selected_house) if allowed
      allowed
    end
  end

  def setup_house!
    selected_house = restore_house!
    user.join_demo_company!
    Demo::ResidentSetup.new(user).call(selected_house)
    selected_house
  end

  class << self
    def authenticate(token)
      return if token.nil?

      scope = includes(:user, :house)
      scope = scope.where("expires_at > ?", Time.current)
      token_digest = Digest::SHA256.hexdigest(token)
      record = scope.find_by(token_digest: token_digest)
      return if record&.user&.max_user_id == "dev"
      return if record&.user&.demo_account? && !Rails.env.development?

      record
    end

    def issue!(user:, house: nil, replacing: nil)
      transaction do
        token = SecureRandom.hex(32)
        record = create!(
          user: user,
          house: house,
          token_digest: Digest::SHA256.hexdigest(token),
          expires_at: LIFETIME.from_now,
        )
        replacing&.destroy!
        [record, token]
      end
    end

    def issue_from_max_launch!(launch, replacing: nil)
      user = User.create_or_find_by!(max_user_id: launch.user_id) do |record|
        if record.demo_account?
          record.first_name = "Иван"
          record.last_name = "Смирнов"
        end
      end
      user.with_lock do
        house = house_for_launch(launch, user)
        unless user.demo_account?
          user.update!(
            first_name: launch.first_name,
            last_name: launch.last_name,
            photo_url: launch.photo_url,
          )
        end
        record, token = issue!(user: user, house: house, replacing: replacing)
        record.setup_house!
        if replacing&.user_id == user.id && record.available_roles.include?(replacing.active_role)
          record.update!(active_role: replacing.active_role)
        end
        [record, token]
      end
    end

    private

    def house_for_launch(launch, user)
      return if user.demo_account?

      case_launch = /\Acase_([1-9]\d{0,18})\z/.match(launch.start_param.to_s)
      house_launch = /\Ahouse_([1-9]\d{0,18})\z/.match(launch.start_param.to_s)
      if case_launch
        house = Case.publicly_visible.find_by(id: case_launch[1])&.house
      elsif house_launch
        house = House.find_by(id: house_launch[1])
      elsif launch.chat_id.present?
        house = House.find_by(max_chat_id: launch.chat_id)
      end

      if house && UserHouse.verify!(user: user, house: house)
        house
      end
    end
  end

  private

  def restore_house!
    return house if house && user.house_access?(house)

    user.with_lock do
      with_lock do
        selected_house = house if house && user.house_access?(house)
        selected_house ||= House.demo
        user.user_houses.create_or_find_by!(house: selected_house) if selected_house
        update!(house: selected_house) if house != selected_house
        selected_house
      end
    end
  end
end
