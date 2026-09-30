# frozen_string_literal: true

module Api
  class BaseController < ::ApplicationController
    include ActionController::Cookies

    before_action :prevent_caching
    before_action :verify_browser_request
    before_action :require_authentication

    rescue_from ActionController::ParameterMissing,
      ActionController::BadRequest,
      ActionDispatch::Http::Parameters::ParseError,
      ActiveSupport::MessageVerifier::InvalidSignature do
      render_error(
        :bad_request,
        "invalid_request",
        "Invalid request",
      )
    end

    rescue_from ActiveRecord::RecordNotFound do
      render_error(
        :not_found,
        "not_found",
        "Record not found",
      )
    end

    rescue_from ActiveRecord::RecordInvalid do
      render_error(
        :unprocessable_entity,
        "invalid_record",
        "Validation failed",
      )
    end

    rescue_from ActiveRecord::StaleObjectError, ActiveRecord::RecordNotUnique do
      render_error(
        :conflict,
        "conflict",
        "Record has changed or already exists",
      )
    end

    rescue_from MaxApiClient::ApiError, Timeout::Error do
      render_error(:service_unavailable, "max_unavailable", "House access cannot be verified")
    end

    private

    def expected_workflow_version
      version = request.request_parameters[:expected_workflow_version]
      unless version.is_a?(Integer) && version >= 0
        raise ActionController::ParameterMissing, :expected_workflow_version
      end
      version
    end

    def current_session
      return @current_session if defined?(@current_session)
      @current_session = Session.authenticate(cookies[Session::COOKIE_NAME])
    end

    def current_user
      current_session&.user
    end

    def current_house
      return @current_house if defined?(@current_house)

      @current_house = current_session&.setup_house!
    end

    def require_authentication
      unless current_user
        render_error(
          :unauthorized,
          "unauthenticated",
          "Authentication required",
        )
      end
    end

    def require_house_access
      unless current_house
        render_error(
          :forbidden,
          "no_house_access",
          "No access to a house",
        )
      end
    end

    def verify_browser_request
      safe_method = request.request_method.in?(["GET", "HEAD", "OPTIONS"])
      unless safe_method || Rails.application.config.x.auth.origins.include?(request.headers["Origin"])
        render_error(
          :forbidden,
          "invalid_origin",
          "Trusted browser request required",
        )
      end
    end

    def prevent_caching
      response.headers["Cache-Control"] = "no-store"
    end

    def render_session(session, house:)
      render(json: UserSerializer.new(
        session.user,
        with_traits: :profile,
        params: { house: house, session: session },
      ).as_json)
    end

    def render_error(status, code, message)
      render(
        json: {
          error: {
            code: code,
            message: message,
          },
        },
        status: status,
      )
    end
  end
end
