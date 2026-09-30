# frozen_string_literal: true

require "set"

class CasePresentation
  def initialize(user:)
    @user = user
  end

  def detail(record, photo_url:, dispatcher: false)
    confirmations = record.case_confirmations
    confirmed = confirmations.exists?(user_id: @user.id)

    CaseSerializer.new(record, with_traits: [:list, :details], params: {
      user: @user,
      confirmation_count: confirmations.count,
      confirmed_by_me: confirmed,
      can_confirm: !dispatcher && !confirmed && record.confirmable_by?(@user),
      last_activity_at: record.case_events.maximum(:occurred_at) || record.created_at,
      photos: record.photos.preload(:blob).to_a,
      photo_url: photo_url,
      workflow: if dispatcher || record.creator_id == @user.id
                  CaseWorkflowPresentation.new(record).detail(role: dispatcher ? :dispatcher : :resident)
                end,
    }).as_json
  end

  def feed(records, confirmation_counts:)
    confirmations = CaseConfirmation.where(case_id: records.map(&:id))
    confirmed_ids = confirmations.where(user: @user)
      .pluck(:case_id)
      .to_set

    records.map do |record|
      confirmed = confirmed_ids.include?(record.id)
      CaseSerializer.new(record, params: {
        user: @user,
        confirmation_count: confirmation_counts.fetch(record.id, 0),
        confirmed_by_me: confirmed,
        can_confirm: !confirmed && record.confirmable_by?(@user),
        last_activity_at: record.last_activity_at,
      }).as_json
    end
  end

  def list(records)
    confirmations = CaseConfirmation.where(case_id: records.map(&:id))
    counts = confirmations.group(:case_id).count
    confirmed_ids = confirmations.where(user: @user)
      .pluck(:case_id)
      .to_set

    records.map do |record|
      confirmed = confirmed_ids.include?(record.id)
      CaseSerializer.new(record, with_traits: :list, params: {
        user: @user,
        confirmation_count: counts.fetch(record.id, 0),
        confirmed_by_me: confirmed,
        can_confirm: !confirmed && record.confirmable_by?(@user),
        last_activity_at: record.last_activity_at,
      }).as_json
    end
  end

  def dispatch_list(records)
    confirmations = CaseConfirmation.where(case_id: records.map(&:id))
    counts = confirmations.group(:case_id).count
    confirmed_ids = confirmations.where(user: @user)
      .pluck(:case_id)
      .to_set

    records.map do |record|
      CaseSerializer.new(record, with_traits: [:list, :dispatch], params: {
        user: @user,
        confirmation_count: counts.fetch(record.id, 0),
        confirmed_by_me: confirmed_ids.include?(record.id),
        can_confirm: false,
        last_activity_at: record.last_activity_at,
      }).as_json
    end
  end
end
