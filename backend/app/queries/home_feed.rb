# frozen_string_literal: true

require "time"

class HomeFeed
  PAGE_SIZE = 20
  CONFIRMATIONS_SQL = "confirmation_totals.confirmation_count"

  Result = Data.define(:records, :active_cases_count, :next_cursor, :confirmation_counts)

  def initialize(house:, user:, sort:, cursor: nil)
    @house = house
    @user = user
    @sort = sort
    @cursor = cursor
    @cursor_purpose = [house.id, user.id, sort].join(":")
  end

  def call
    unless ["activity", "confirmations"].include?(@sort)
      raise ActionController::BadRequest
    end

    scope = Case.visible_to(@user)
      .active
      .where(house: @house)
    total = scope.count
    scope = CaseActivityQuery.new(scope).call.preload(:case_type, :current_step)
    rows, counts = if @sort == "confirmations"
      confirmations_page(scope)
    else
      activity_page(scope)
    end
    has_more = rows.size > PAGE_SIZE
    rows = rows.first(PAGE_SIZE)
    next_cursor = if has_more
      encode_cursor(rows.last, count: counts.fetch(rows.last.id))
    end
    Result.new(rows, total, next_cursor, counts)
  end

  private

  def activity_page(scope)
    activity = CaseActivityQuery::ACTIVITY_SQL
    unless @cursor.nil?
      _count, at, id = cursor_position
      scope = scope.where("(#{activity}, cases.id) < (?, ?)", at, id)
    end
    rows = scope.order(Arel.sql("#{activity} DESC, cases.id DESC"))
      .limit(PAGE_SIZE + 1)
      .to_a
    page = rows.first(PAGE_SIZE)
    counts = CaseConfirmation.where(case_id: page.map(&:id))
      .group(:case_id)
      .count
    counts = page.to_h do |record|
      [record.id, counts.fetch(record.id, 0)]
    end
    [rows, counts]
  end

  def confirmations_page(scope)
    activity = CaseActivityQuery::ACTIVITY_SQL
    scope = scope.publicly_visible.joins(<<~SQL)
      LEFT JOIN LATERAL (
        SELECT COUNT(*) AS confirmation_count
        FROM case_confirmations WHERE case_id = cases.id
      ) confirmation_totals ON TRUE
    SQL
    unless @cursor.nil?
      count, at, id = cursor_position
      scope = scope.where(
        "(#{CONFIRMATIONS_SQL}, #{activity}, cases.id) < (?, ?, ?)",
        count,
        at,
        id,
      )
    end
    rows = scope.select("#{CONFIRMATIONS_SQL} AS confirmation_count")
      .order(Arel.sql("#{CONFIRMATIONS_SQL} DESC, #{activity} DESC, cases.id DESC"))
      .limit(PAGE_SIZE + 1)
      .to_a
    counts = rows.first(PAGE_SIZE).to_h do |record|
      [record.id, record.confirmation_count.to_i]
    end
    [rows, counts]
  end

  def cursor_position
    count, activity, id = cursor_verifier.verify(@cursor.to_s, purpose: @cursor_purpose)
    [count, Time.iso8601(activity), id]
  end

  def encode_cursor(record, count:)
    payload = [
      count,
      record.last_activity_at.iso8601(6),
      record.id,
    ]
    cursor_verifier.generate(payload, purpose: @cursor_purpose)
  end

  def cursor_verifier
    Rails.application.message_verifier("home_feed")
  end
end
