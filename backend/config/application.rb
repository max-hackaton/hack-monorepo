# frozen_string_literal: true

require_relative "boot"

require "rails/all"

Bundler.require(*Rails.groups)

module Hackaton
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults(8.1)
    config.action_cable.mount_path = nil
    # Case photos are served through the authenticated, house-scoped API.
    config.active_storage.draw_routes = false

    # Ignore lib directories that must not be reloaded or eager loaded.
    config.autoload_lib(ignore: ["assets", "tasks"])


    # Only loads a smaller set of middleware suitable for API only apps.
    # Middleware like session, flash, cookies can be added back manually.
    # Skip views, helpers and assets when generating a new resource.
    config.api_only = true
    config.middleware.use(ActionDispatch::Cookies)
  end
end
