# frozen_string_literal: true

class ContractorCatalogSeeds
  CONTACTS = {
    "apt install mirea" => "88000000000",
    "Стромынка Клининг" => "88000000001",
    "МИРЭА Техсервис" => "88000000002",
  }.freeze
  LEGACY_NAMES = ["OOO apt install mirea", "ООО ДомСервис", "ООО Городская аварийная служба"].freeze
  CATEGORIES = {
    "heating" => [0, 2],
    "elevator" => [2],
    "yard" => [0, 1, 2],
    "leak" => [0, 2],
    "hot_water" => [0, 2],
    "cold_water" => [2],
    "electricity" => [0, 2],
    "other" => [],
  }.freeze

  class << self
    def call(houses)
      houses.group_by(&:management_company).each do |company, company_houses|
        new(company, company_houses).call
      end
    end
  end

  def initialize(company, houses)
    @company = company
    @houses = houses
  end

  def call
    @company.with_lock do
      types = CaseType.for_creation.to_a
      CONTACTS.each_with_index do |(name, phone), index|
        contractor = find_contractor(name, phone, index)
        selected_types = types.select { |type| CATEGORIES.fetch(type.key).include?(index) }
        remove_legacy_rules(contractor, types, selected_types)
        rules = selected_types.flat_map { |type| rules_for(contractor, type) }
        if rules.any?
          ContractorRouting.insert_all(rules, unique_by: :index_contractor_routings_house_unique)
        end
      end
    end
  end

  private

  def find_contractor(name, phone, index)
    contractor = @company.contractors.find_by(name: name) ||
      @company.contractors.find_by(name: LEGACY_NAMES.fetch(index)) ||
      @company.contractors.new(phone: phone)
    contractor.name = name
    contractor.save! if contractor.changed?
    contractor
  end

  def remove_legacy_rules(contractor, types, selected_types)
    contractor.contractor_routings.where(house: @houses, case_type: types)
      .where.not(case_type: selected_types).delete_all
  end

  def rules_for(contractor, type)
    problem = type.constructor.fetch("fields").find { |field| field.fetch("key") == "problem" }
    @houses.flat_map do |house|
      problem.fetch("options").map do |option|
        {
          management_company_id: @company.id,
          contractor_id: contractor.id,
          house_id: house.id,
          case_type_id: type.id,
          problem_key: option.fetch("key"),
        }
      end
    end
  end
end
