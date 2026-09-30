# frozen_string_literal: true

module Api
  module Dispatch
    class CaseTypesController < ::Api::Dispatch::BaseController
      def index
        types = CaseTypeSerializer.new(CaseType.for_creation, with_traits: :catalog).as_json
        render(json: { case_types: types })
      end

      def show
        type = CaseType.for_creation.find_by!(key: params[:key])
        steps = type.steps.order(:sort_order).to_a
        render(json: CaseTypeSerializer.new(type, with_traits: :details, params: { steps: steps }).as_json)
      end
    end
  end
end
