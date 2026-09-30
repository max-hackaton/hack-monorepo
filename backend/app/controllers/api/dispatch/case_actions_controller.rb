# frozen_string_literal: true

module Api
  module Dispatch
    class CaseActionsController < BaseController
      def create
        record = dispatch_cases.find(dispatch_id(params[:case_id]))
        attributes = json_strings(:action, :expected_current_step_key)
        CaseWorkflow.new(record).perform!(
          action: attributes.fetch(:action),
          actor: current_user,
          role: :dispatcher,
          expected_current_step_key: attributes.fetch(:expected_current_step_key),
          expected_workflow_version: expected_workflow_version,
          body: json_body[:body],
        )
        render(json: case_details(record))
      end
    end
  end
end
