# frozen_string_literal: true

require "time"

class CaseHistory
  PAGE_SIZE = 50
  Result = Data.define(:records, :next_cursor)

  def initialize(record:, user:, access_mode:, cursor: nil)
    @record = record
    @access_mode = access_mode
    @cursor = cursor
    @cursor_purpose = [user.id, record.id, access_mode].join(":")
  end

  def call
    scope = @record.case_events
    scope = scope.where(event_type: CaseEvent::HISTORY_TYPES)
    if @access_mode == "resident_neighbor"
      scope = scope.where.not(event_type: CaseEvent::PRIVATE_TYPES)
    end
    scope = apply_cursor(scope) unless @cursor.nil?
    scope = scope.includes(:actor_user)
    scope = scope.order(occurred_at: :desc, id: :desc)
    scope = scope.limit(PAGE_SIZE + 1)
    entries = scope.to_a
    has_more = entries.size > PAGE_SIZE
    entries = entries.first(PAGE_SIZE)
    next_cursor = if has_more
      encode_cursor(entries.last)
    end
    Result.new(entries, next_cursor)
  end

  private

  def apply_cursor(scope)
    occurred_at, event_id = cursor_verifier.verify(@cursor.to_s, purpose: @cursor_purpose)
    at = Time.iso8601(occurred_at)
    scope.where(
      "(occurred_at, id) < (?, ?)",
      at,
      event_id,
    )
  end

  def encode_cursor(entry)
    payload = [
      entry.occurred_at.iso8601(6),
      entry.id,
    ]
    cursor_verifier.generate(payload, purpose: @cursor_purpose)
  end

  def cursor_verifier
    Rails.application.message_verifier("case_history")
  end
end
