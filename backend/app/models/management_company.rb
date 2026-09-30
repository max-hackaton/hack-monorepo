# frozen_string_literal: true

class ManagementCompany < ApplicationRecord
  has_many :contractors, dependent: :restrict_with_exception
  has_many :contractor_routings, dependent: :restrict_with_exception
  has_many :houses, dependent: :nullify
  has_many :cases, dependent: :nullify
  has_many :management_company_memberships, dependent: :delete_all
  has_many :users, through: :management_company_memberships

  validates :name, presence: true
end
