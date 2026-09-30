# frozen_string_literal: true

module Api
  module Dispatch
    class CaseEventsController < ::Api::Dispatch::BaseController
      def index
        record = dispatch_cases.find(Integer(params[:case_id], 10, exception: false))

        history = CaseHistory.new(
          record: record,
          user: current_user,
          access_mode: "dispatcher",
          cursor: params[:cursor],
        ).call
        events = CaseEventSerializer.new(history.records).as_json
        render(json: { events: events, next_cursor: history.next_cursor })
      end
    end
  end
end
