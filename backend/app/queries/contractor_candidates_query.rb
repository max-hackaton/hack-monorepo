# frozen_string_literal: true

class ContractorCandidatesQuery
  def initialize(record, case_type:, problem_key:)
    @record = record
    @case_type = case_type
    @problem_key = problem_key
  end

  def call
    rules = ContractorRouting.where(
      management_company_id: @record.management_company_id,
      case_type: @case_type,
      problem_key: @problem_key,
    )
    rules = rules.joins(:contractor).where(contractors: { archived: false })
    house_rules = rules.where(house_id: @record.house_id)
    if house_rules.exists?
      rules = house_rules
    else
      rules = rules.where(house_id: nil)
    end
    Contractor.where(id: rules.select(:contractor_id)).order(:name, :id)
  end

  def preferred(current:)
    choices = call.to_a
    return current if choices.include?(current)

    choices.first if choices.one?
  end
end
