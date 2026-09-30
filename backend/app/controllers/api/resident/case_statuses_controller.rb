# frozen_string_literal: true

module Api
  module Resident
    class CaseStatusesController < ::Api::BaseController
      before_action :require_house_access
      wrap_parameters false

      def update
        record = current_house
          .cases
          .where(creator: current_user)
          .find(params[:case_id])
        step = record
          .case_type
          .steps
          .find_by!(key: params.expect(:step_key))
        CaseWorkflow.new(record).transition_to!(
          actor: current_user,
          step: step,
          expected_workflow_version: expected_workflow_version,
        )

        photo_url = ->(photo) { api_case_photo_path(record, photo) }
        details = CasePresentation.new(user: current_user).detail(record, photo_url: photo_url)
        render(json: details)
      end
    end
  end
end
