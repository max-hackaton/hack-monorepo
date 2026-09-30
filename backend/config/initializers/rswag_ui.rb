# frozen_string_literal: true

Rswag::Ui.configure do |config|
  config.openapi_endpoint("/docs/openapi.yaml", "Домочатцы API")
  config.config_object["withCredentials"] = true
  config.config_object["persistAuthorization"] = false
  config.config_object["validatorUrl"] = nil
end
