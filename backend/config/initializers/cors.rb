# frozen_string_literal: true

Rails.application.config.middleware.insert_before(0, Rack::Cors) do
  allow do
    origins(*Rails.application.config.x.auth.origins)
    resource "/api/*",
      headers: ["Content-Type"],
      methods: [:get, :head, :post, :put, :patch, :delete, :options],
      credentials: true,
      max_age: 600
  end
end
