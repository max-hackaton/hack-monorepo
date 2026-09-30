# frozen_string_literal: true

require "date"

module Api
  module Dispatch
    class CasesController < ::Api::Dispatch::BaseController
      rescue_from DispatchCaseList::AccessDenied do
        render_error(:forbidden, "dispatch_forbidden", "Management company access required")
      end

      def index
        list = DispatchCaseList.new(
          user: current_user,
          filters: case_filters,
          cursor: params[:cursor],
        ).call
        cases = CasePresentation.new(user: current_user).dispatch_list(list.records)
        render(json: { cases: cases, next_cursor: list.next_cursor })
      end

      def show
        scope = dispatch_cases
        scope = scope.preload(:case_type, :current_step, :house, :management_company, :contractor)
        record = scope.find(Integer(params[:id], 10, exception: false))

        steps = StepSerializer.new(CaseWorkflow.new(record).available_steps).as_json
        assigned_contractor = if record.contractor
          ContractorSerializer.new(record.contractor, with_traits: :details).as_json
        end
        available_contractors = ContractorSerializer.new(
          CaseClassification.new(record).available_contractors,
          with_traits: :details,
        ).as_json
        action_form = DispatchActionForm.new(record)
        render(json: {
          case: case_details(record),
          management_company: ManagementCompanySerializer.new(record.management_company).as_json,
          available_steps: steps,
          assigned_contractor: assigned_contractor,
          available_contractors: available_contractors,
          next_action: action_form.summary,
          transitions: action_form.transitions,
        })
      end

      private

      def case_filters
        input = request.query_parameters.symbolize_keys
        raise ActionController::BadRequest if input.key?(:house_id)
        created_from = timestamp(input[:created_from])
        created_to = timestamp(input[:created_to])
        if created_from && created_to && created_from >= created_to
          raise ActionController::BadRequest
        end
        if input.key?(:status_key) && input.key?(:status_keys)
          raise ActionController::BadRequest
        end

        {
          management_company_id: company_id(input[:management_company_id]),
          house_ids: selected_houses(input[:house_ids]),
          is_emergency: emergency_flag(input[:is_emergency]),
          classification_status: choice(input[:classification_status], ["pending", "confirmed"]),
          status_key: choice(input[:status_key], Step::STATUS_KEYS),
          status_keys: status_keys(input[:status_keys]),
          created_from: created_from,
          created_to: created_to,
        }
      end

      def company_id(value)
        return if value.nil?
        unless value.is_a?(String) && /\A[1-9]\d*\z/.match?(value)
          raise ActionController::BadRequest
        end
        value.to_i
      end

      def selected_houses(value)
        return if value.nil?
        ids = parse_house_ids(value)
        raise ActionController::BadRequest if ids.empty?
        ids
      end

      def emergency_flag(value)
        case value
        when nil
          nil
        when "true"
          true
        when "false"
          false
        else
          raise ActionController::BadRequest
        end
      end

      def status_keys(value)
        return if value.nil?
        unless value.is_a?(Array) && value.present? && value.size <= Step::STATUS_KEYS.size
          raise ActionController::BadRequest
        end
        unless value.all? { |status| status.is_a?(String) && Step::STATUS_KEYS.include?(status) }
          raise ActionController::BadRequest
        end
        value.uniq.sort
      end

      def timestamp(value)
        return if value.nil?
        raise ActionController::BadRequest unless value.is_a?(String)
        DateTime.rfc3339(value).to_time.utc
      rescue ArgumentError
        raise ActionController::BadRequest
      end

      def choice(value, options)
        return if value.nil?
        raise ActionController::BadRequest unless options.include?(value)
        value
      end
    end
  end
end
