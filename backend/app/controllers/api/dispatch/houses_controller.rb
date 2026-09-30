# frozen_string_literal: true

module Api
  module Dispatch
    class HousesController < ::Api::Dispatch::BaseController
      def index
        houses, next_after_id = directory_page(House.for_dispatcher(current_user))
        render(json: {
          houses: HouseSerializer.new(houses).as_json,
          next_after_id: next_after_id,
        })
      end
    end
  end
end
