# frozen_string_literal: true

class ContractorRouting < ApplicationRecord
  belongs_to :management_company
  belongs_to :contractor
  belongs_to :case_type
  belongs_to :house, optional: true

  validates :problem_key, presence: true
  validates :problem_key, uniqueness: { scope: [:contractor_id, :case_type_id, :house_id] }
  validate :selection_is_valid
  validate :company_matches

  private

  def selection_is_valid
    unless case_type&.problem_option(problem_key)
      errors.add(:problem_key, "is not a constructor choice")
    end
  end

  def company_matches
    if contractor && contractor.management_company_id != management_company_id
      errors.add(:contractor, "must belong to the management company")
    end
    if house && house.management_company_id != management_company_id
      errors.add(:house, "must belong to the management company")
    end
  end
end
