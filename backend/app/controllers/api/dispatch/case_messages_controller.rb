# frozen_string_literal: true

module Api
  module Dispatch
    class CaseMessagesController < ::Api::Dispatch::BaseController
      def create
        record = dispatch_cases.find(Integer(params[:case_id], 10, exception: false))
        attributes = json_strings(:body)

        event = CaseEvent.add_message!(
          record,
          actor: current_user,
          body: attributes.fetch(:body),
          sender_role: "dispatcher",
        )
        render(
          json: CaseEventSerializer.new(event).as_json,
          status: :created,
        )
      end
    end
  end
end
