# frozen_string_literal: true

class BillingRoute < ApplicationRecord
  belongs_to :house
  belongs_to :case_type
  has_many :recalculation_requests, dependent: :restrict_with_exception

  validates :adapter, inclusion: { in: ["uk", "rko"] }
  validates :case_type_id, uniqueness: { scope: :house_id }
end
