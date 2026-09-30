# frozen_string_literal: true

module Billing
  class Router
    def initialize(record)
      @record = record
    end

    def route
      attributes = { house_id: @record.house_id, case_type_id: @record.case_type_id }
      configured = BillingRoute.find_by(attributes)
      return configured if configured

      adapter = BillingRoute::DEFAULT_ADAPTERS[@record.case_type.key]
      return unless adapter

      BillingRoute.insert_all( # rubocop:disable Rails/SkipsModelValidations -- Preserve a concurrently configured route.
        [attributes.merge(adapter: adapter)],
        unique_by: :index_billing_routes_on_house_id_and_case_type_id,
      )
      BillingRoute.find_by!(attributes)
    end

    class << self
      def adapter(key)
        { "uk" => UkAdapter, "rko" => RkoAdapter }.fetch(key).new
      end
    end
  end
end
