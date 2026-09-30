# frozen_string_literal: true

require "time"

class CaseList
  PAGE_SIZE = 20
  Result = Data.define(:records, :next_cursor)

  def initialize(house:, user:, scope:, status: nil, cursor: nil)
    @house = house
    @user = user
    @scope = scope
    @status = status
    @cursor = cursor
    @cursor_purpose = [user.id, house.id, scope, status].compact.join(":")
  end

  def call
    unless ["mine", "subscriptions"].include?(@scope)
      raise ActionController::BadRequest
    end
    unless @status.nil? || ["active", "completed"].include?(@status)
      raise ActionController::BadRequest
    end

    rows = page_scope.to_a
    has_more = rows.size > PAGE_SIZE
    rows = rows.first(PAGE_SIZE)
    next_cursor = if has_more
      encode_cursor(rows.last)
    end
    Result.new(rows, next_cursor)
  end

  private

  def selected_cases
    scope = Case.where(house: @house)
    if @scope == "mine"
      scope.where(creator: @user)
    else
      confirmed_cases = CaseConfirmation.where(user: @user).select(:case_id)
      scope.publicly_visible.where(id: confirmed_cases)
    end
  end

  def page_scope
    scope = CaseActivityQuery.new(status_scope).call
    scope = apply_cursor(scope) unless @cursor.nil?
    scope.preload(:case_type, :current_step, :contractor)
      .order(Arel.sql("#{CaseActivityQuery::ACTIVITY_SQL} DESC, cases.id DESC"))
      .limit(PAGE_SIZE + 1)
  end

  def status_scope
    scope = selected_cases
    return scope if @status.nil?

    scope = scope.joins(:current_step)
    if @status == "completed"
      scope.where(steps: { status_key: "completed" })
    else
      scope.where.not(steps: { status_key: "completed" })
    end
  end

  def apply_cursor(scope)
    activity, id = cursor_verifier.verify(@cursor.to_s, purpose: @cursor_purpose)
    at = Time.iso8601(activity)
    scope.where(
      "(#{CaseActivityQuery::ACTIVITY_SQL}, cases.id) < (?, ?)",
      at,
      id,
    )
  end

  def encode_cursor(record)
    payload = [
      record.last_activity_at.iso8601(6),
      record.id,
    ]
    cursor_verifier.generate(payload, purpose: @cursor_purpose)
  end

  def cursor_verifier
    Rails.application.message_verifier("case_list")
  end
end
