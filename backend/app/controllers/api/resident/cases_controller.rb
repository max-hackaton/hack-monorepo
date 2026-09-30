# frozen_string_literal: true

require "date"

module Api
  module Resident
    class CasesController < ::Api::BaseController
      REQUIRED_FIELDS = [:case_type_key, :problem_key, :description, :visibility].freeze
      STRING_FIELDS = (REQUIRED_FIELDS + [:location_details]).freeze
      DATE_FIELDS = [:violation_started_at, :violation_ended_at].freeze
      INPUT_FIELDS = (STRING_FIELDS + DATE_FIELDS + [:is_emergency, :photos]).freeze

      before_action :require_house_access
      wrap_parameters false

      def index
        list = CaseList.new(
          house: current_house,
          user: current_user,
          scope: params[:scope] || "mine",
          status: params[:status],
          cursor: params[:cursor],
        ).call
        cases = CasePresentation.new(user: current_user).list(list.records)
        render(json: { cases: cases, next_cursor: list.next_cursor })
      end

      def show
        record = current_house
          .cases
          .visible_to(current_user)
          .preload(:case_type, :current_step, :contractor)
          .find(params[:id])

        render(json: case_details(record))
      end

      def create
        attributes = case_params
        case_type = CaseType.find_by!(key: attributes.delete(:case_type_key))
        record = Case.report!(
          house: current_house,
          creator: current_user,
          case_type: case_type,
          **attributes,
        )
        render(
          json: case_details(record),
          status: :created,
          location: api_case_url(record),
        )
      end

      private

      def case_params
        unless request.media_type.in?(["application/json", "multipart/form-data"])
          raise ActionController::BadRequest
        end
        body = request.request_parameters
        raise ActionController::BadRequest if body.key?("_json")
        input = body.slice(*INPUT_FIELDS.map(&:to_s)).symbolize_keys
        validate_strings(input)
        DATE_FIELDS.each do |field|
          input[field] = timestamp(input[field])
        end
        multipart = request.media_type == "multipart/form-data"
        input[:is_emergency] = if input.key?(:is_emergency)
          emergency_flag(input[:is_emergency], multipart: multipart)
        else
          false
        end
        input[:photos] = photo_uploads(input.fetch(:photos, []), multipart: multipart)
        if REQUIRED_FIELDS.any? { |field| input[field].blank? }
          raise ActiveRecord::RecordInvalid
        end
        input
      end

      def validate_strings(input)
        STRING_FIELDS.each do |field|
          value = input[field]
          if value.nil? && !REQUIRED_FIELDS.include?(field)
            next
          end
          unless value.is_a?(String) && !value.include?("\u0000")
            raise ActionController::BadRequest
          end
        end
      end

      def timestamp(value)
        return if value.nil?
        raise ActionController::BadRequest unless value.is_a?(String)
        DateTime.rfc3339(value).to_time.utc
      rescue ArgumentError
        raise ActionController::BadRequest
      end

      def emergency_flag(value, multipart:)
        if multipart
          raise ActionController::BadRequest unless ["true", "false"].include?(value)
          value == "true"
        else
          raise ActionController::BadRequest unless [true, false].include?(value)
          value
        end
      end

      def photo_uploads(value, multipart:)
        raise ActionController::BadRequest unless value.is_a?(Array)
        value.map do |photo|
          unless multipart && photo.is_a?(ActionDispatch::Http::UploadedFile)
            raise ActionController::BadRequest
          end
          {
            io: photo.tempfile,
            filename: photo.original_filename,
            content_type: Marcel::MimeType.for(photo.tempfile),
            identify: false,
          }
        end
      end

      def case_details(record)
        CasePresentation.new(user: current_user).detail(
          record,
          photo_url: ->(photo) { api_case_photo_path(record, photo) },
        )
      end
    end
  end
end
