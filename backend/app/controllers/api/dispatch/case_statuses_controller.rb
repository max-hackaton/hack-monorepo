# frozen_string_literal: true

module Api
  module Dispatch
    class CaseStatusesController < ::Api::Dispatch::BaseController
      def update
        record = dispatch_cases.find(Integer(params[:case_id], 10, exception: false))
        attributes = json_strings(:step_key, :expected_current_step_key)
        attributes.require([:step_key, :expected_current_step_key])

        step = record
          .case_type
          .steps
          .find_by!(key: attributes.fetch(:step_key))
        CaseWorkflow.new(record).transition_to!(
          actor: current_user,
          step: step,
          role: :dispatcher,
          expected_current_step_key: attributes.fetch(:expected_current_step_key),
          expected_workflow_version: expected_workflow_version,
        )
        render(json: case_details(record))
      end
    end
  end
end
