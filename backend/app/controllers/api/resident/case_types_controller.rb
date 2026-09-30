# frozen_string_literal: true

module Api
  module Resident
    class CaseTypesController < ::Api::BaseController
      before_action :require_house_access

      def index
        case_types = CaseTypeSerializer.new(CaseType.for_creation, with_traits: :catalog).as_json
        render(json: { case_types: case_types })
      end

      def show
        case_type = CaseType.find_by!(key: params[:key])

        steps = case_type.steps.order(:sort_order).to_a
        render(json: CaseTypeSerializer.new(case_type, with_traits: :details, params: { steps: steps }).as_json)
      end
    end
  end
end
