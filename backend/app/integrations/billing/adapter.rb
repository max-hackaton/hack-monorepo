# frozen_string_literal: true

module Billing
  class Adapter
    Receipt = Data.define(:status, :external_id)

    # Replace the demo transport with an idempotent HTTP client when a real contract exists.
    def submit(request)
      Receipt.new(status: "submitted", external_id: "demo-#{request.adapter}-#{request.id}")
    end
  end
end
