# frozen_string_literal: true

module Api
  module Dispatch
    class CaseAssignmentsController < ::Api::Dispatch::BaseController
      def update
        record = dispatch_cases.find(dispatch_id(params[:case_id]))
        attributes = json_strings(:contractor_id)

        CaseClassification.new(record).assign!(
          actor: current_user,
          contractor_id: dispatch_id(attributes.require(:contractor_id)),
          expected_version: expected_classification_version,
        )
        render(json: case_details(record))
      end
    end
  end
end
