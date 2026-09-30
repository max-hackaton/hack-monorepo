# frozen_string_literal: true

module Api
  module Dispatch
    class HouseSelectionsController < ::Api::Dispatch::BaseController
      def show
        render_selection
      end

      def update
        house_ids = parse_house_ids(json_body[:house_ids])
        unless DispatchHouseSelection.replace_for(current_user, house_ids)
          return render_error(:forbidden, "dispatch_forbidden", "Management company house access required")
        end

        render_selection
      end

      private

      def render_selection
        houses = House.for_dispatcher(current_user)
          .where(id: current_user.dispatch_house_selections.select(:house_id))
          .order(:id)
        render(json: {
          houses: houses.map { |house| HouseSerializer.new(house).as_json },
        })
      end
    end
  end
end
