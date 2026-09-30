# frozen_string_literal: true

class House < ApplicationRecord
  DEMO_CHAT_ID = "__DEMO_HOUSE__"
  DEMO_CHAT_IDS = [DEMO_CHAT_ID, *(2..30).map { |number| "__DEMO_HOUSE_#{number}__" }].freeze

  belongs_to :management_company, optional: true
  has_many :cases, dependent: :restrict_with_exception
  has_many :sessions, dependent: :nullify
  has_many :user_houses, dependent: :delete_all

  validates :full_address, :max_chat_id, presence: true

  scope :for_dispatcher, lambda { |user|
    company_ids = user.dispatch_companies.select(:id)
    where(management_company_id: company_ids)
      .or(where(id: Case.where(management_company_id: company_ids).select(:house_id)))
  }

  class << self
    def demo
      house = find_or_create_by!(max_chat_id: DEMO_CHAT_ID) do |record|
        record.full_address = "ул. Пушкина, д. Колотушкина"
      end
      unless house.management_company_id
        house.with_lock do
          unless house.management_company_id
            house.update!(management_company: ManagementCompany.create!(name: "УК «Орион»"))
          end
        end
      end
      house
    end
  end

  def demo?
    DEMO_CHAT_IDS.include?(max_chat_id)
  end

  def legacy_development?
    /\A__DEV_HOUSE(?:_\d+)?__\z/.match?(max_chat_id)
  end

  def display_address
    full_address.sub(/\A(Демо-дом чата -?\d{3})\d+\z/, '\1…')
  end
end
