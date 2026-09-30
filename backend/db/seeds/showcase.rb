# frozen_string_literal: true

require "yaml"

class ShowcaseSeeds
  ADDRESSES = YAML.safe_load_file(File.join(__dir__, "showcase_houses.yml")).freeze
  LEGACY_ADDRESSES = [
    ["Тестовый дом", "Демо-дом улица Пушкина, дом Колотушкина"],
    ["ул. Лесная, д. 7"],
    ["ул. Лесная, д. 9"],
    ["ул. Садовая, д. 12"],
    ["ул. Садовая, д. 14"],
    ["пр-т Мира, д. 25"],
    ["пр-т Мира, д. 27"],
    ["ул. Центральная, д. 3"],
  ].freeze

  class << self
    def run
      house = House.find_or_create_by!(max_chat_id: House::DEMO_CHAT_ID) do |record|
        record.full_address = ADDRESSES.first
      end

      new(house: house).call
      User.where("max_user_id ~ ?", "^[1-9][0-9]*$").find_each(&:join_demo_company!)
    end
  end

  def initialize(house:)
    @house = house
  end

  def call
    @house.with_lock do
      company = setup_company
      houses = setup_houses(company)
      resident = setup_user(User::DEMO_MAX_USER_ID, "Иван", "Смирнов")
      dispatcher = setup_user("demo_dispatcher", "Анна", "Кузнецова")
      [resident, dispatcher].each do |user|
        user.management_company_memberships.find_or_create_by!(management_company: company)
      end
      houses.first(3).each do |house|
        link = resident.user_houses.find_or_initialize_by(house: house)
        link.verified_at ||= Time.current
        link.save! if link.changed?
      end
      ContractorCatalogSeeds.call(houses)
      houses.each_with_index do |house, index|
        scenarios = scenarios_for(index)
        Demo::CaseScenarios.new(
          house: house, resident: resident, dispatcher: dispatcher, namespace: "demo",
        ).call(scenarios: scenarios)
      end
    end
  end

  private

  def setup_company
    company = @house.management_company
    unless company
      company = ManagementCompany.create!(name: "УК «Орион»")
      @house.update!(management_company: company)
    end
    if ["Тестовая УО", "Демонстрационная УК"].include?(company.name)
      company.update!(name: "УК «Орион»")
    end
    company
  end

  def setup_houses(company)
    chat_ids = House::DEMO_CHAT_IDS
    ADDRESSES.each_with_index.map do |address, index|
      house = House.find_or_create_by!(max_chat_id: chat_ids.fetch(index)) do |record|
        record.full_address = address
        record.management_company = company
      end
      house.update!(management_company: company) unless house.management_company_id
      if LEGACY_ADDRESSES.fetch(index, []).include?(house.full_address)
        house.update!(full_address: address)
      end
      house.cases.where(management_company_id: nil).find_each do |record|
        record.update!(management_company: house.management_company)
      end
      house
    end
  end

  def setup_user(id, first_name, last_name)
    user = User.find_or_create_by!(max_user_id: id)
    if user.first_name.blank? || ["Житель", "Диспетчер"].include?(user.first_name)
      user.update!(first_name: first_name, last_name: last_name)
    end
    user
  end

  def scenarios_for(index)
    return Demo::CaseScenarios::SCENARIOS if index.zero?

    neighbors = Demo::CaseScenarios::SCENARIOS.select { |_key, value| value["creator"] == "neighbor" }
    neighbors.to_a.rotate(index).first(2).to_h.transform_values do |scenario|
      scenario.merge("subscribed" => false, "subscribers" => [index % 7, 3].min)
    end
  end
end
