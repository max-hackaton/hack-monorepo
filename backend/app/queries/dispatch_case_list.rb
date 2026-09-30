# frozen_string_literal: true

require "time"

class DispatchCaseList
  PAGE_SIZE = 20
  Result = Data.define(:records, :next_cursor)

  class AccessDenied < StandardError
  end

  def initialize(user:, filters:, cursor: nil)
    @user = user
    @filters = filters
    @cursor = cursor
  end

  def call
    @allowed_company_ids = @user.dispatch_companies.order(:id).pluck(:id)
    raise AccessDenied unless filters_accessible?

    rows = page_scope.to_a
    has_more = rows.size > PAGE_SIZE
    rows = rows.first(PAGE_SIZE)
    next_cursor = if has_more
      encode_cursor(rows.last)
    end
    Result.new(rows, next_cursor)
  end

  private

  def filtered_scope
    filters = {
      management_company_id: @filters[:management_company_id],
      house_id: @filters[:house_ids],
      is_emergency: @filters[:is_emergency],
    }.compact

    scope = Case.where(management_company_id: @allowed_company_ids).where(filters)
    if @filters[:created_from]
      scope = scope.where("cases.created_at >= ?", @filters[:created_from])
    end
    if @filters[:created_to]
      scope = scope.where("cases.created_at < ?", @filters[:created_to])
    end
    case @filters[:classification_status]
    when "pending"
      scope = scope.where(classified_at: nil)
    when "confirmed"
      scope = scope.where.not(classified_at: nil)
    end
    statuses = @filters[:status_keys] || @filters[:status_key]
    if statuses
      scope = scope.joins(:current_step).where(steps: { status_key: statuses })
    end
    scope
  end

  def page_scope
    scope = filtered_scope
    scope = apply_cursor(scope) unless @cursor.nil?
    CaseActivityQuery.new(scope)
      .call
      .preload(:case_type, :current_step, :contractor, :house, :management_company)
      .order(created_at: :desc, id: :desc)
      .limit(PAGE_SIZE + 1)
  end

  def apply_cursor(scope)
    unless @cursor.is_a?(String)
      raise ActiveSupport::MessageVerifier::InvalidSignature
    end
    created_at, id = cursor_verifier.verify(@cursor, purpose: cursor_purpose)
    scope.where("(cases.created_at, cases.id) < (?, ?)", Time.iso8601(created_at), id)
  end

  def encode_cursor(record)
    cursor_verifier.generate(
      [record.created_at.iso8601(6), record.id],
      purpose: cursor_purpose,
    )
  end

  def cursor_purpose
    [
      @user.id,
      @allowed_company_ids,
      @filters[:management_company_id],
      @filters[:house_ids],
      @filters[:created_from]&.iso8601(6),
      @filters[:created_to]&.iso8601(6),
      @filters[:is_emergency],
      @filters[:classification_status],
      @filters[:status_key],
      @filters[:status_keys],
    ].to_json
  end

  def cursor_verifier
    Rails.application.message_verifier("dispatch_case_list")
  end

  def filters_accessible?
    return false if @allowed_company_ids.empty?
    if @filters[:management_company_id] && !@allowed_company_ids.include?(@filters[:management_company_id])
      return false
    end
    return true if @filters[:house_ids].nil?

    houses = House.for_dispatcher(@user).where(id: @filters[:house_ids])
    houses.count == @filters[:house_ids].size
  end
end
