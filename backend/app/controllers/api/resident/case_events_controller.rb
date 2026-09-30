# frozen_string_literal: true

module Api
  module Resident
    class CaseEventsController < ::Api::BaseController
      before_action :require_house_access

      def index
        record = current_house
          .cases
          .visible_to(current_user)
          .find(params[:case_id])

        access_mode = if record.creator_id == current_user.id
          "resident_creator"
        else
          "resident_neighbor"
        end

        history = CaseHistory.new(
          record: record,
          user: current_user,
          access_mode: access_mode,
          cursor: params[:cursor],
        ).call
        events = CaseEventSerializer.new(history.records).as_json
        render(json: { events: events, next_cursor: history.next_cursor })
      end
    end
  end
end
