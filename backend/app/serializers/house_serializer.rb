# frozen_string_literal: true

class HouseSerializer
  include Alba::Resource

  attribute(:id) { |house| house.id.to_s }
  attribute(:full_address) { |house| house.display_address }
end
