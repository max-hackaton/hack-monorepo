# frozen_string_literal: true

module Api
  module Dispatch
    class CaseActionFormsController < BaseController
      def show
        record = dispatch_cases.includes(:case_type, :current_step, :contractor)
          .find(dispatch_id(params[:case_id]))
        unless params[:expected_current_step_key] == record.current_step.key &&
            version(:expected_workflow_version) == record.workflow_version &&
            version(:expected_classification_version) == record.classification_version
          raise ActiveRecord::StaleObjectError.new(record, "prepare action")
        end

        render(json: DispatchActionForm.new(record).form(
          intent: params[:intent], transition_key: params[:transition_key],
        ))
      end

      private

      def version(key)
        value = params[key]
        raise ActionController::BadRequest unless value.is_a?(String) && /\A\d+\z/.match?(value)

        value.to_i
      end
    end
  end
end
