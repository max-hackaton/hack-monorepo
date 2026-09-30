# frozen_string_literal: true

class ManagementCompanyMembership < ApplicationRecord
  belongs_to :user
  belongs_to :management_company

  validates :user_id, uniqueness: { scope: :management_company_id }
end
