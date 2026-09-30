# frozen_string_literal: true

class CaseTypeSerializer
  include Alba::Resource

  attributes :key, :name

  trait :catalog do
    attributes :description
  end

  trait :details do
    attributes :description, :constructor
    many :steps, resource: StepSerializer, source: ->(params) { params.fetch(:steps) }
  end
end
