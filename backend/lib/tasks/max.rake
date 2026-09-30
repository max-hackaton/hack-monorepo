# frozen_string_literal: true

namespace :max do
  task subscribe: :environment do
    Max::WebhookSubscription.new(
      webhook_host: ENV.fetch("API_HOST"),
      bot_token: ENV.fetch("MAX_BOT_TOKEN"),
      secret: ENV.fetch("MAX_WEBHOOK_SECRET"),
    ).register!
  end
end
