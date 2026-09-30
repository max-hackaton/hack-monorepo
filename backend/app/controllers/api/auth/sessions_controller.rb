# frozen_string_literal: true

module Api
  module Auth
    class SessionsController < ::Api::BaseController
      skip_before_action :require_authentication, only: [:create, :destroy]
      wrap_parameters false

      def create
        raw = params.expect(:init_data).to_s

        if raw == User::DEVELOPMENT_LOGIN_MARKER
          raise ArgumentError unless Rails.env.development?

          launch = ::Max::LaunchData::Data.new(User::DEMO_MAX_USER_ID, nil, nil, nil, nil, nil)
        else
          raise ArgumentError if raw.start_with?("__DEV_", "__DEMO_")

          launch = ::Max::LaunchData.new(
            raw,
            bot_token: ENV.fetch("MAX_BOT_TOKEN"),
          ).data
        end

        record, session_token = Session.issue_from_max_launch!(launch, replacing: current_session)
        expire_legacy_cookie
        cookies[Session::COOKIE_NAME] = auth_cookie_options.merge(
          value: session_token,
          expires: record.expires_at,
        )
        render_session(record, house: record.house)
      rescue ArgumentError
        render_error(
          :unauthorized,
          "invalid_max_data",
          "Invalid or expired MAX launch data",
        )
      end

      def show
        render_session(current_session, house: current_house)
      end

      def update
        role = params.expect(:role)
        unless Session::ACTIVE_ROLES.include?(role)
          return render_error(:bad_request, "invalid_request", "Invalid request")
        end
        unless current_session.available_roles.include?(role)
          return render_error(:forbidden, "dispatch_forbidden", "Management company access required")
        end

        house = current_house
        current_session.transaction do
          if role == "dispatcher"
            DispatchHouseSelection.select_demo_default_for(current_user, house)
          end
          current_session.update!(active_role: role)
        end
        render_session(current_session, house: house)
      end

      def destroy
        current_session&.destroy!
        response.delete_cookie(Session::COOKIE_NAME, auth_cookie_options)
        expire_legacy_cookie
        head(:no_content)
      end

      private

      def auth_cookie_options
        Rails.application.config.x.auth.cookie_options
      end

      def expire_legacy_cookie
        options = auth_cookie_options
        return unless options[:partitioned]

        response.delete_cookie(Session::COOKIE_NAME, options.except(:partitioned))
      end
    end
  end
end
