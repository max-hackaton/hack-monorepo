# frozen_string_literal: true

module Api
  module Auth
    class SessionHousesController < ::Api::BaseController
      wrap_parameters false

      def update
        house = current_user
          .houses
          .find(params.expect(:house_id))

        unless current_session.select_house!(house)
          return render_error(
            :forbidden,
            "no_house_access",
            "No access to a house",
          )
        end

        render_session(current_session, house: house)
      end
    end
  end
end
