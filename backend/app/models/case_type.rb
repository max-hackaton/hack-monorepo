# frozen_string_literal: true

require "yaml"

class CaseType < ApplicationRecord
  CATALOG = YAML.safe_load_file(Rails.root.join("config/case_type_constructors.yml")).freeze

  has_many :steps, dependent: :restrict_with_exception
  has_many :cases, dependent: :restrict_with_exception

  validates :key, :name, presence: true

  class << self
    def for_creation
      scope = where(key: CATALOG.keys)
      scope.order(:sort_order, :id)
    end
  end

  def problem_option(problem_key)
    definition = CATALOG[key]
    return unless definition

    fields = definition["constructor"]["fields"]
    problem = fields.find do |field|
      field["key"] == "problem"
    end
    if problem
      problem["options"].find do |option|
        option["key"] == problem_key
      end
    end
  end

  def constructor
    definition = CATALOG[key]
    definition = CATALOG["other"] unless definition
    definition["constructor"]
  end
end
