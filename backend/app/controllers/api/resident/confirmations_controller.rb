# frozen_string_literal: true

module Api
  module Resident
    class ConfirmationsController < ::Api::BaseController
      before_action :require_house_access

      def create
        record = current_house
          .cases
          .publicly_visible
          .find(params[:case_id])
        CaseConfirmation.confirm!(record, user: current_user)
        render(json: {
          confirmation_count: record.case_confirmations.count,
          confirmed_by_me: true,
          can_confirm: false,
        })
      end
    end
  end
end
