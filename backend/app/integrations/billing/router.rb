# frozen_string_literal: true

module Billing
  class Router
    def initialize(record)
      @record = record
    end

    def route
      BillingRoute.find_by(house_id: @record.house_id, case_type_id: @record.case_type_id)
    end

    class << self
      def adapter(key)
        { "uk" => UkAdapter, "rko" => RkoAdapter }.fetch(key).new
      end
    end
  end
end
