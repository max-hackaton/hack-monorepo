# frozen_string_literal: true

module Api
  module Resident
    class HousesController < ::Api::BaseController
      def index
        scope = current_user.houses
        scope = scope.where(max_chat_id: House::DEMO_CHAT_IDS) if current_user.demo_account?
        scope = scope.order(:id)
        houses = scope.map do |house|
          HouseSerializer.new(house).as_json
        end
        render(json: { houses: houses })
      end
    end
  end
end
