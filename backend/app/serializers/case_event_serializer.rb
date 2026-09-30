# frozen_string_literal: true

class CaseEventSerializer
  include Alba::Resource

  DATA_KEYS = {
    "case_created" => [],
    "classification_confirmed" => ["from", "to"],
    "contractor_assigned" => ["previous_contractor", "contractor"],
    "confirmation_added" => [],
    "message_added" => ["body", "sender_role"],
    "status_changed" => ["from_step_key", "to_step_key", "from_status_key", "to_status_key"],
    "work_started" => ["from_status_key", "to_status_key"],
    "work_finished" => ["from_status_key", "to_status_key", "violation_ended_at"],
    "clarification_requested" => ["from_status_key", "to_status_key", "body"],
    "clarification_answered" => ["from_status_key", "to_status_key", "body", "question_id"],
    "repair_confirmed" => ["from_status_key", "to_status_key", "request_id"],
    "repair_rejected" => ["from_status_key", "to_status_key"],
    "recalculation_confirmed" => ["from_status_key", "to_status_key", "request_id"],
    "recalculation_missing" => ["from_status_key", "to_status_key", "request_id"],
    "recalculation_retried" => ["from_status_key", "to_status_key", "request_id"],
    "recalculation_resumed" => ["from_status_key", "to_status_key", "request_id"],
    "recalculation_submitted" => ["request_id", "adapter"],
    "recalculation_failed" => ["request_id", "adapter"],
  }.freeze

  attributes :event_type
  attribute(:id) { |event| event.id.to_s }
  attribute(:occurred_at) { |event| event.occurred_at.iso8601(6) }
  attribute(:data) { |event| event.data.slice(*DATA_KEYS.fetch(event.event_type, [])) }
  one :actor_user, key: :actor, resource: UserSerializer, with_traits: :actor
end
