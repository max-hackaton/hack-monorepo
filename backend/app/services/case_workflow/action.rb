# frozen_string_literal: true

class CaseWorkflow
  class Action
    def initialize(record)
      @record = record
    end

    def apply!(action, body:)
      target = TRANSITIONS.fetch(action)[2]
      data = {}
      request = nil
      case action
      when "resume_recalculation"
        request = @record.recalculation_requests.order(:id).last
        data[:request_id] = request.id.to_s
      when "request_clarification", "answer_clarification"
        validate_body!(body)
        data[:body] = body.strip
        if action == "answer_clarification"
          question = @record.case_events.where(event_type: "clarification_requested").order(:id).last
          data[:question_id] = question&.id&.to_s
        end
      when "finish_work"
        @record.violation_ended_at = Time.current
        @record.return_reason = nil
        data[:violation_ended_at] = @record.violation_ended_at.iso8601(6)
      when "reject_repair"
        @record.violation_ended_at = nil
        @record.return_reason = "repair_not_resolved"
      when "reject_recalculation"
        @record.return_reason = "recalculation_missing"
        data[:request_id] = @record.recalculation_requests.order(:id).last.id.to_s
      when "confirm_repair", "retry_recalculation"
        route = Billing::Router.new(@record).route
        if action == "retry_recalculation" && !route
          @record.errors.add(:base, "Billing route is no longer configured")
          raise ActiveRecord::RecordInvalid, @record
        end
        if route
          request = RecalculationRequest.prepare!(@record, route: route)
          target = "awaiting_recalculation"
          data[:request_id] = request.id.to_s
        end
        @record.return_reason = nil
      when "confirm_recalculation"
        @record.return_reason = nil
        data[:request_id] = @record.recalculation_requests.order(:id).last.id.to_s
      end
      [target, data, request]
    end

    private

    def validate_body!(body)
      return if body.is_a?(String) && body.strip.present? && body.length <= 5000 && !body.include?("\u0000")

      @record.errors.add(:base, "Clarification must contain 1 to 5000 characters")
      raise ActiveRecord::RecordInvalid, @record
    end
  end
end
