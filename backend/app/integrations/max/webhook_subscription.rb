# frozen_string_literal: true

require "max_api_client"
require "logger"

module Max
  class WebhookSubscription
    def initialize(webhook_host:, bot_token:, secret:)
      @webhook_host = webhook_host
      @secret = secret
      @api = MaxApiClient::Api.new(
        token: bot_token,
        open_timeout: 2,
        read_timeout: 5,
        logger: Rails.logger,
      )
    end

    def register!
      response = Rails.logger.silence(Logger::INFO) do
        @api.subscribe(
          "https://#{@webhook_host}/max/webhook",
          update_types: [
            "bot_added",
            "bot_admin_permissions_changed",
            "user_added",
            "user_removed",
            "message_created",
            "bot_started",
          ],
          secret: @secret,
        )
      end
      if response["success"]
        true
      else
        raise "MAX subscription rejected"
      end
    end
  end
end
