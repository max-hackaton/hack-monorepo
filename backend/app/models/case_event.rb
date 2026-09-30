# frozen_string_literal: true

class CaseEvent < ApplicationRecord
  HISTORY_TYPES = [
    "case_created",
    "classification_confirmed",
    "contractor_assigned",
    "confirmation_added",
    "message_added",
    "status_changed",
    "work_started",
    "work_finished",
    "clarification_requested",
    "clarification_answered",
    "repair_confirmed",
    "repair_rejected",
    "recalculation_confirmed",
    "recalculation_missing",
    "recalculation_retried",
    "recalculation_resumed",
    "recalculation_submitted",
    "recalculation_failed",
  ].freeze

  PRIVATE_TYPES = ["message_added", "clarification_requested", "clarification_answered"].freeze

  belongs_to :case
  belongs_to :actor_user, class_name: "User", optional: true
  store_accessor :data, :body

  validates :event_type, :occurred_at, presence: true
  validates :body,
    presence: true,
    length: { maximum: 5000 },
    if: -> { event_type == "message_added" }

  class << self
    def add_message!(record, actor:, body:, sender_role: "resident")
      record.with_lock do
        if record.completed?
          record.errors.add(:base, "Completed case conversation is closed")
          raise ActiveRecord::RecordInvalid, record
        end

        event = create!(
          case: record,
          actor_user: actor,
          event_type: "message_added",
          occurred_at: Time.current,
          data: {
            body: body,
            sender_role: sender_role,
          },
        )
        if sender_role == "resident"
          CaseWorkflow.new(record).resume_after_resident_message!(actor: actor)
        end
        event
      end
    end

    def record_classification!(actor:, from:, to:, occurred_at:)
      create!(
        actor_user: actor,
        event_type: "classification_confirmed",
        occurred_at: occurred_at,
        data: { from: from, to: to },
      )
    end

    def record_assignment!(actor:, previous:, contractor:)
      create!(
        actor_user: actor,
        event_type: "contractor_assigned",
        occurred_at: Time.current,
        data: {
          previous_contractor: contractor_snapshot(previous),
          contractor: contractor_snapshot(contractor),
        },
      )
    end

    private

    def contractor_snapshot(contractor)
      { id: contractor.id.to_s, name: contractor.name } if contractor
    end
  end
end
