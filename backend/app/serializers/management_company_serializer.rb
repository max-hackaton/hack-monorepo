# frozen_string_literal: true

class ManagementCompanySerializer
  include Alba::Resource

  attributes :name
  attribute(:id) { |company| company.id.to_s }
end
