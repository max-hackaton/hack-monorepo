# frozen_string_literal: true

module Api
  module Resident
    class CaseActionFormsController < ::Api::BaseController
      before_action :require_house_access

      def show
        record = current_house.cases.where(creator: current_user).includes(:current_step).find(params[:case_id])
        version = params[:expected_workflow_version]
        raise ActionController::BadRequest unless version.is_a?(String) && /\A\d+\z/.match?(version)
        raise ActionController::BadRequest unless params[:expected_current_step_key].is_a?(String)
        unless params[:expected_current_step_key] == record.current_step.key && version.to_i == record.workflow_version
          raise ActiveRecord::StaleObjectError.new(record, "prepare action")
        end

        action = request.query_parameters[:action]
        unless action.is_a?(String) && CaseWorkflow.new(record).available_actions(role: :resident).include?(action)
          raise ActiveRecord::RecordInvalid, record
        end

        render(json: ResidentActionForm.new(record).build(action))
      end
    end
  end
end
