# frozen_string_literal: true

module Max
  class WebhooksController < ::ApplicationController
    def create
      if authenticated?
        update = ActionController::Parameters.new(request.request_parameters)
        if update["update_type"] == "message_created"
          reply_to_message(update.require(:message))
        elsif update["update_type"] == "bot_started"
          Max::WelcomeMessage.new(chat_id: update.require(:chat_id)).deliver
        elsif update["is_channel"] == false
          case update["update_type"]
          when "bot_added"
            register_house(update)
          when "bot_admin_permissions_changed"
            register_house(update) if update["is_admin"] == true
          when "user_added", "user_removed"
            update_membership(update)
          end
        end
        head(:ok)
      else
        head(:unauthorized)
      end
    rescue MaxApiClient::ApiError => error
      Rails.logger.warn({
        event: "max_webhook_failed",
        update_type: request.request_parameters["update_type"],
        chat_id: request.request_parameters["chat_id"],
        status: error.status,
        code: error.code,
      }.to_json)
      head(:service_unavailable)
    rescue Timeout::Error
      head(:service_unavailable)
    end

    private

    def reply_to_message(message)
      sender = message[:sender]
      if sender.nil? || sender[:is_bot]
        return
      end

      recipient = message.require(:recipient)
      case recipient[:chat_type]
      when "dialog"
        Max::WelcomeMessage.new(user_id: sender.require(:user_id)).deliver
      when "chat"
        chat_id = recipient.require(:chat_id).to_s
        house = House.find_by(max_chat_id: chat_id)
        Max::WelcomeMessage.new(house: house, chat_id: chat_id).reply_if_mentioned(message)
      end
    end

    def register_house(update)
      chat_id = update.require(:chat_id).to_s
      house = House.create_or_find_by!(max_chat_id: chat_id) do |record|
        record.full_address = "Демо-дом чата #{chat_id}"
        record.management_company = House.demo.management_company
      end
      Max::WelcomeMessage.new(house: house).deliver
    end

    def update_membership(update)
      house = House.find_by(max_chat_id: update.require(:chat_id).to_s)
      user = User.find_by(max_user_id: update.require(:user).require(:user_id).to_s)
      unless house && user
        return
      end

      if update[:update_type] == "user_added"
        UserHouse.verify!(user: user, house: house)
      else
        timestamp = update.require(:timestamp)
        unless timestamp.is_a?(Integer) && timestamp.positive?
          raise ActionController::BadRequest
        end

        removed_at = Time.at(Rational(timestamp, 1000)).utc
        UserHouse.revoke!(user: user, house: house, removed_at: removed_at)
      end
      user.sessions.where(house: nil).find_each do |session|
        session.setup_house!
      end
    end

    def authenticated?
      secret = ENV["MAX_WEBHOOK_SECRET"]
      supplied = request.headers["X-Max-Bot-Api-Secret"]
      if secret.blank? || supplied.blank?
        return false
      end

      ActiveSupport::SecurityUtils.secure_compare(secret, supplied)
    end
  end
end
