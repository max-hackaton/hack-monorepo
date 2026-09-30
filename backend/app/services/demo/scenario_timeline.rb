# frozen_string_literal: true

module Demo
  class ScenarioTimeline
    def initialize(record)
      @record = record
      @random = Random.new(record.id)
    end

    def call(last_activity_before:)
      @events = @record.case_events.order(:id).to_a
      occurred_at = last_activity_before - @random.rand(5..35).minutes
      @events.reverse_each do |event|
        data = event.data.dup
        data["violation_ended_at"] = occurred_at.iso8601(6) if data.key?("violation_ended_at")
        event.update!(occurred_at: occurred_at, created_at: occurred_at, updated_at: occurred_at, data: data)
        gap = event.event_type == "confirmation_added" ? @random.rand(15..90) : @random.rand(120..1080)
        occurred_at -= gap
      end
      update_case
      update_confirmations
      update_billing_requests
    end

    private

    def update_case
      classification = @events.find { |event| event.event_type == "classification_confirmed" }
      finish = @events.reverse.find { |event| event.event_type == "work_finished" }
      @record.update!(
        created_at: @events.first.occurred_at,
        updated_at: @events.last.occurred_at,
        classified_at: classification&.occurred_at,
        violation_ended_at: @record.violation_ended_at ? finish&.occurred_at : nil,
      )
    end

    def update_confirmations
      @record.case_confirmations.each do |confirmation|
        event = @events.find do |item|
          item.event_type == "confirmation_added" && item.actor_user_id == confirmation.user_id
        end
        confirmation.update!(
          confirmed_at: event.occurred_at, created_at: event.occurred_at, updated_at: event.occurred_at,
        )
      end
    end

    def update_billing_requests
      @record.recalculation_requests.each do |request|
        events = @events.select { |event| event.data["request_id"] == request.id.to_s }
        submission = events.find { |event| event.event_type == "recalculation_submitted" }
        payload = request.payload.merge(
          "violation_started_at" => @record.violation_started_at&.iso8601(6),
          "violation_ended_at" => @record.violation_ended_at&.iso8601(6),
        )
        # Only newly created fixtures reach this point; align their immutable billing snapshot before commit.
        RecalculationRequest.where(id: request.id).update_all(
          created_at: events.first.occurred_at,
          updated_at: submission&.occurred_at || events.first.occurred_at,
          submitted_at: submission&.occurred_at,
          payload: payload,
        )
      end
    end
  end
end
