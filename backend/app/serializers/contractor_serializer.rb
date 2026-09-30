# frozen_string_literal: true

class ContractorSerializer
  include Alba::Resource

  attributes :name
  attribute(:id) { |contractor| contractor.id.to_s }

  trait :details do
    attributes :phone, :max_url, :archived
  end
end
