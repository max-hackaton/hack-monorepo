# frozen_string_literal: true

module Api
  module Dispatch
    class ContractorRoutingsController < ::Api::Dispatch::BaseController
      def index
        scope = dispatch_company.contractor_routings.includes(:case_type)
        routings, next_after_id = directory_page(scope)
        render(json: {
          contractor_routings: ContractorRoutingSerializer.new(routings).as_json,
          next_after_id: next_after_id,
        })
      end

      def create
        company = dispatch_company
        body = json_body

        attributes = body.permit(:contractor_id, :case_type_key, :problem_key, :house_id)
        attributes.require([:contractor_id, :case_type_key, :problem_key])
        contractor = company.contractors
          .where(archived: false)
          .find(dispatch_id(attributes[:contractor_id]))
        type = CaseType.for_creation.find_by!(key: attributes[:case_type_key])
        if attributes[:house_id].present?
          house = company.houses.find(dispatch_id(attributes[:house_id]))
        end

        routing = company.contractor_routings.create!(
          contractor: contractor,
          case_type: type,
          problem_key: attributes[:problem_key],
          house: house,
        )
        render(json: ContractorRoutingSerializer.new(routing).as_json, status: :created)
      end

      def destroy
        routing = dispatch_company.contractor_routings.find(dispatch_id(params[:id]))
        routing.destroy!
        head(:no_content)
      end
    end
  end
end
