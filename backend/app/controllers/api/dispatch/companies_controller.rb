# frozen_string_literal: true

module Api
  module Dispatch
    class CompaniesController < ::Api::Dispatch::BaseController
      def index
        companies = current_user.dispatch_companies.order(:name, :id)
        render(json: { companies: ManagementCompanySerializer.new(companies).as_json })
      end
    end
  end
end
