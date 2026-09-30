# frozen_string_literal: true

module Api
  module Dispatch
    class BaseController < ::Api::BaseController
      class JsonRequired < StandardError; end

      before_action :require_dispatch_access
      wrap_parameters false

      rescue_from JsonRequired do
        render_error(:unsupported_media_type, "json_required", "JSON body required")
      end

      private

      def dispatch_cases
        company_ids = current_user.dispatch_companies.select(:id)
        Case.where(management_company_id: company_ids)
      end

      def dispatch_company
        current_user.dispatch_companies.find(dispatch_id(params[:company_id]))
      end

      def dispatch_id(value)
        id = Integer(value, 10, exception: false)
        raise ActiveRecord::RecordNotFound unless id
        id
      end

      def parse_house_ids(value)
        unless value.is_a?(Array) && value.size <= 1000
          raise ActionController::BadRequest
        end

        ids = value.map do |id|
          unless id.is_a?(String) && /\A[1-9]\d*\z/.match?(id)
            raise ActionController::BadRequest
          end
          id.to_i
        end
        ids.uniq.sort
      end

      def directory_page(scope)
        unless params[:after_id].nil?
          after_id = Integer(params[:after_id], 10, exception: false)
          raise ActionController::ParameterMissing, :after_id unless after_id&.positive?
          scope = scope.where("id > ?", after_id)
        end

        rows = scope.order(:id)
          .limit(101)
          .to_a
        next_after_id = if rows.size > 100
          rows[99].id.to_s
        end
        [rows.first(100), next_after_id]
      end

      def require_dispatch_access
        unless current_user.dispatcher_access?
          render_error(:forbidden, "dispatch_forbidden", "Management company access required")
        end
      end

      def case_details(record)
        CasePresentation.new(user: current_user).detail(
          record,
          photo_url: ->(photo) { api_dispatch_case_photo_path(record, photo) },
          dispatcher: true,
        )
      end

      def json_body
        raise JsonRequired unless request.media_type == "application/json"
        @json_body ||= begin
          body = request.request_parameters
          raise ActionController::ParameterMissing, :body if body.key?("_json")
          ActionController::Parameters.new(body)
        end
      end

      def json_strings(*keys)
        attributes = json_body.permit(*keys)
        keys.each do |key|
          value = attributes[key]
          unless value.is_a?(String) && !value.include?("\u0000")
            raise ActionController::ParameterMissing, key
          end
        end
        attributes
      end

      def expected_classification_version
        version = json_body[:expected_classification_version]
        unless version.is_a?(Integer) && version >= 0
          raise ActionController::ParameterMissing, :expected_classification_version
        end
        version
      end
    end
  end
end
