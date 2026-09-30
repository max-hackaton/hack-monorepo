# frozen_string_literal: true

module Api
  module Resident
    class CaseActionsController < ::Api::BaseController
      before_action :require_house_access
      wrap_parameters false

      def create
        unless request.media_type == "application/json"
          return render_error(:unsupported_media_type, "json_required", "JSON body required")
        end
        attributes = ActionController::Parameters.new(request.request_parameters).permit(
          :action, :expected_current_step_key, :body
        )
        [:action, :expected_current_step_key].each do |key|
          raise ActionController::ParameterMissing, key unless attributes[key].is_a?(String)
        end
        record = current_house.cases.where(creator: current_user).find(params[:case_id])
        CaseWorkflow.new(record).perform!(
          action: attributes.fetch(:action),
          actor: current_user,
          role: :resident,
          expected_current_step_key: attributes.fetch(:expected_current_step_key),
          expected_workflow_version: expected_workflow_version,
          body: attributes[:body],
        )
        render(json: CasePresentation.new(user: current_user).detail(
          record, photo_url: ->(photo) { api_case_photo_path(record, photo) }
        ))
      end
    end
  end
end
