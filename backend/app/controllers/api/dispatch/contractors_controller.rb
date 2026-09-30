# frozen_string_literal: true

module Api
  module Dispatch
    class ContractorsController < ::Api::Dispatch::BaseController
      def index
        contractors, next_after_id = directory_page(dispatch_company.contractors)
        render(json: {
          contractors: ContractorSerializer.new(contractors, with_traits: :details).as_json,
          next_after_id: next_after_id,
        })
      end

      def create
        company = dispatch_company
        body = json_body

        attributes = body.permit(:name, :phone, :max_url)
        attributes.require([:name, :phone])
        contractor = company.contractors.create!(attributes)
        render(json: ContractorSerializer.new(contractor, with_traits: :details).as_json, status: :created)
      end

      def update
        contractor = dispatch_company.contractors.find(dispatch_id(params[:id]))
        body = json_body

        contractor.update!(body.permit(:name, :phone, :max_url, :archived))
        render(json: ContractorSerializer.new(contractor, with_traits: :details).as_json)
      end
    end
  end
end
