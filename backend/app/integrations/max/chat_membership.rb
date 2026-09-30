# frozen_string_literal: true

require "max_api_client"

module Max
  class ChatMembership
    def initialize(bot_token: ENV["MAX_BOT_TOKEN"])
      @api = MaxApiClient::Api.new(
        token: bot_token,
        open_timeout: 2,
        read_timeout: 3,
        logger: Rails.logger,
      )
    end

    def member?(chat_id:, user_id:)
      response = @api.get_chat_members(chat_id, user_ids: [user_id])
      members = response.fetch("members")
      members.any? do |member|
        member["user_id"].to_s == user_id.to_s
      end
    end
  end
end
