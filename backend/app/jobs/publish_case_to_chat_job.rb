# frozen_string_literal: true

class PublishCaseToChatJob < ApplicationJob
  CATEGORY_EMOJIS = {
    "heating" => "♨️",
    "elevator" => "🛗",
    "yard" => "🌳",
    "leak" => "💧",
    "hot_water" => "🚿",
    "cold_water" => "🚰",
    "electricity" => "💡",
    "other" => "🛠️",
  }.freeze

  queue_as :default
  self.enqueue_after_transaction_commit = true

  def perform(event_id)
    event = CaseEvent.find_by(id: event_id, event_type: "case_created")
    return unless event

    event.with_lock do
      if publishable?(event)
        message_id = publish(event.case)
        event.update!(data: event.data.merge("max_message_id" => message_id))
      end
    end
  rescue MaxApiClient::ApiError => error
    unless error.status == 429 && executions < 5
      raise
    end

    retry_job(wait: 10.seconds)
  end

  private

  def publishable?(event)
    record = event.case
    record.visibility == "public" &&
      record.house.max_chat_id.match?(/\A-?\d+\z/) &&
      event.data["max_message_id"].nil?
  end

  def publish(record)
    api = MaxApiClient::Api.new(
      token: ENV["MAX_BOT_TOKEN"], open_timeout: 2, read_timeout: 3, logger: Rails.logger,
    )
    username = api.get_my_info.fetch("username")
    button = {
      type: "open_app",
      text: "Открыть заявку",
      web_app: username,
      payload: "case_#{record.id}",
    }
    keyboard = { type: "inline_keyboard", payload: { buttons: [[button]] } }
    message = api.send_message_to_chat(record.house.max_chat_id, message_text(record), attachments: [keyboard])
    message.fetch("body").fetch("mid")
  end

  def message_text(record)
    description = record.description
    summary = description.split(/\s+(?:Прошу|Дата начала нарушения:)/, 2).first.strip
    location = record.location_details&.strip
    date = description.lines.find { |line| line.start_with?("Дата начала нарушения:") }
    emoji = CATEGORY_EMOJIS.fetch(record.case_type.key, CATEGORY_EMOJIS.fetch("other"))
    text = "#{emoji} #{record.case_type.name} • Жилец\n\n#{summary.truncate(3000)}"
    text += "\nМесто: #{location}" if location.present?
    text += "\n#{date.strip}" if date
    text
  end
end
