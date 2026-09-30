# frozen_string_literal: true

class CaseConfirmation < ApplicationRecord
  belongs_to :case
  belongs_to :user

  validates :confirmed_at, presence: true

  class << self
    def confirm!(record, user:)
      record.with_lock do
        existing = record.case_confirmations.find_by(user: user)
        next existing if existing

        raise ActiveRecord::RecordInvalid, record unless record.confirmable_by?(user)

        confirmation = create!(case: record, user: user, confirmed_at: Time.current)
        record.case_events.create!(
          actor_user: user,
          event_type: "confirmation_added",
          occurred_at: confirmation.confirmed_at,
        )
        confirmation
      end
    end
  end
end
