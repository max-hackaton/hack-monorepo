# frozen_string_literal: true

class RecalculationRequestSerializer
  include Alba::Resource

  attribute(:id) { |record| record.id.to_s }
  attribute(:route_id) { |record| record.billing_route_id.to_s }
  attributes :adapter, :status, :external_id, :transmission_error
  attribute(:created_at) { |record| record.created_at.iso8601(6) }
  attribute(:submitted_at) { |record| record.submitted_at&.iso8601(6) }
end
