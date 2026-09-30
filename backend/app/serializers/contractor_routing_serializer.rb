# frozen_string_literal: true

class ContractorRoutingSerializer
  include Alba::Resource

  attributes :problem_key
  attribute(:id) { |routing| routing.id.to_s }
  attribute(:contractor_id) { |routing| routing.contractor_id.to_s }
  attribute(:case_type_key) { |routing| routing.case_type.key }
  attribute(:house_id) { |routing| routing.house_id&.to_s }
end
