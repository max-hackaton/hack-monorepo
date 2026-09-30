# frozen_string_literal: true

class RecalculationRequest < ApplicationRecord
  belongs_to :case
  belongs_to :billing_route

  attr_readonly :case_id, :billing_route_id, :adapter, :payload

  validates :status, inclusion: { in: ["pending", "submitted", "failed"] }
  validates :adapter, :payload, presence: true
  validates :external_id, :submitted_at, presence: true, if: -> { status == "submitted" }
  validates :transmission_error, presence: true, if: -> { status == "failed" }

  class << self
    def prepare!(record, route:)
      create!(case: record, billing_route: route, adapter: route.adapter, payload: {
        case_id: record.id.to_s,
        house_id: record.house_id.to_s,
        house_address: record.house.full_address,
        case_type: record.case_type.key,
        problem_key: record.problem_key,
        description: record.description,
        violation_started_at: record.violation_started_at&.iso8601(6),
        violation_ended_at: record.violation_ended_at&.iso8601(6),
      })
    end
  end
end
