# frozen_string_literal: true

module Api
  module Resident
    class CaseMessagesController < ::Api::BaseController
      before_action :require_house_access
      wrap_parameters false

      def create
        body = params.expect(:body)
        raise ActionController::BadRequest unless body.is_a?(String)

        record = current_house
          .cases
          .where(creator: current_user)
          .find(params[:case_id])
        event = CaseEvent.add_message!(
          record,
          actor: current_user,
          body: body,
        )
        render(
          json: CaseEventSerializer.new(event).as_json,
          status: :created,
        )
      end
    end
  end
end
