# frozen_string_literal: true

class StepSerializer
  include Alba::Resource

  attributes :key, :kind, :status_key, :title, :description, :sort_order
end
