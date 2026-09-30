# frozen_string_literal: true

module Api
  module Dispatch
    class CaseClassificationsController < ::Api::Dispatch::BaseController
      def update
        record = dispatch_cases.find(dispatch_id(params[:case_id]))
        attributes = json_strings(:case_type_key, :problem_key)

        emergency = params[:is_emergency]
        if params.key?(:is_emergency) && ![true, false].include?(emergency)
          raise ActionController::ParameterMissing, :is_emergency
        end

        attributes.require([:case_type_key, :problem_key])
        type = CaseType.for_creation.find_by!(key: attributes[:case_type_key])
        CaseClassification.new(record).confirm!(
          actor: current_user,
          case_type: type,
          problem_key: attributes[:problem_key],
          is_emergency: emergency,
          expected_version: expected_classification_version,
        )
        render(json: case_details(record))
      end
    end
  end
end
