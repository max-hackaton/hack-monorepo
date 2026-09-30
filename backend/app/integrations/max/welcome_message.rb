# frozen_string_literal: true

require "max_api_client"

module Max
  class WelcomeMessage
    TEXT = "Привет! Откройте приложение, чтобы посмотреть информацию по вашему дому."

    def initialize(house: nil, chat_id: nil, user_id: nil, bot_token: ENV["MAX_BOT_TOKEN"])
      @house = house
      @chat_id = chat_id || house&.max_chat_id
      @user_id = user_id
      @api = MaxApiClient::Api.new(
        token: bot_token,
        open_timeout: 2,
        read_timeout: 3,
        logger: Rails.logger,
      )
    end

    def reply_if_mentioned(message)
      mentions = Array(message.dig(:body, :markup)).select { |item| item[:type] == "user_mention" }
      usernames = message.dig(:body, :text)
        .to_s
        .scan(/(?:\A|\s)@(\w+)/)
        .flatten
      if mentions.empty? && usernames.empty?
        return
      end

      mentioned = mentions.any? do |item|
        item[:user_id].to_s == bot.fetch("user_id").to_s ||
          item[:user_link].to_s.casecmp?("@#{bot.fetch('username')}")
      end
      mentioned ||= usernames.any? do |username|
        username.casecmp?(bot.fetch("username"))
      end
      deliver if mentioned
    end

    def deliver
      username = bot.fetch("username")
      button = {
        type: "open_app",
        text: "Открыть приложение",
        web_app: username,
      }
      button[:payload] = "house_#{@house.id}" if @house
      keyboard = {
        type: "inline_keyboard",
        payload: { buttons: [[button]] },
      }
      if @user_id
        @api.send_message_to_user(@user_id, TEXT, attachments: [keyboard])
      else
        @api.send_message_to_chat(@chat_id, TEXT, attachments: [keyboard])
      end
    end

    private

    def bot
      @bot ||= @api.get_my_info
    end
  end
end
