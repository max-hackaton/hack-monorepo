# frozen_string_literal: true

module Billing
  class Submission
    def initialize(request)
      @request = request
    end

    def call
      return @request unless @request.reload.status == "pending"

      receipt, error = submit
      record = @request.case
      record.with_lock do
        next unless @request.reload.status == "pending"

        if error
          @request.update!(status: "failed", transmission_error: error)
          record.update!(
            current_step: record.case_type.steps.find_by!(status_key: "in_progress"),
            return_reason: "billing_failed",
          )
        else
          @request.update!(status: receipt.status, external_id: receipt.external_id, submitted_at: Time.current)
        end
        record.update!(workflow_version: record.workflow_version + 1)
        record.case_events.create!(
          event_type: error ? "recalculation_failed" : "recalculation_submitted",
          occurred_at: Time.current,
          data: { request_id: @request.id.to_s, adapter: @request.adapter },
        )
      end
      @request
    end

    private

    def submit
      receipt = Router.adapter(@request.adapter).submit(@request)
      unless receipt.status == "submitted" && receipt.external_id.is_a?(String) && receipt.external_id.present?
        raise ArgumentError, "Invalid billing receipt"
      end
      [receipt, nil]
    rescue StandardError => error
      # Adapter messages can contain credentials or payloads; expose a stable safe error instead.
      Rails.logger.error({ event: "billing_submission_failed", request_id: @request.id, error_class: error.class.name })
      [nil, "Не удалось передать данные в биллинговый адаптер. Повторите отправку."]
    end
  end
end
