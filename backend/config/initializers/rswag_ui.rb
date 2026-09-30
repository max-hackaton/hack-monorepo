# frozen_string_literal: true

if Rails.env.development? || Rails.env.test?
  Rswag::Ui.configure do |config|
    config.openapi_endpoint("/docs/openapi.yaml", "MAX Mini App API")
    config.config_object["withCredentials"] = true
    config.config_object["persistAuthorization"] = false
    config.config_object["validatorUrl"] = nil
  end
end
