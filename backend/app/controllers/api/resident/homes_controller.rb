# frozen_string_literal: true

module Api
  module Resident
    class HomesController < ::Api::BaseController
      before_action :require_house_access

      def show
        feed = HomeFeed.new(
          house: current_house,
          user: current_user,
          sort: params[:sort] || "activity",
          cursor: params[:cursor],
        ).call
        cases = CasePresentation.new(user: current_user).feed(
          feed.records, confirmation_counts: feed.confirmation_counts
        )
        render(json: {
          viewer: UserSerializer.new(current_user, with_traits: :viewer).as_json,
          house: HouseSerializer.new(current_house).as_json,
          active_cases_count: feed.active_cases_count,
          cases: cases,
          next_cursor: feed.next_cursor,
        })
      end
    end
  end
end
