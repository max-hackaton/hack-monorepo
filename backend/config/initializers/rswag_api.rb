# frozen_string_literal: true

if Rails.env.development? || Rails.env.test?
  Rswag::Api.configure do |config|
    config.openapi_root = Rails.root.to_s
  end
end
