# frozen_string_literal: true

class Step < ApplicationRecord
  STATUS_KEYS = [
    "new", "in_progress", "action_required", "closed_by_executor", "awaiting_recalculation", "completed",
  ].freeze

  belongs_to :case_type
  has_many :cases, foreign_key: :current_step_id, inverse_of: :current_step, dependent: :restrict_with_exception

  validates :key, :kind, :title, presence: true
  validates :status_key, inclusion: { in: STATUS_KEYS }
  validates :sort_order, numericality: { only_integer: true }
  validate :case_type_unchanged_when_used, on: :update

  private

  def case_type_unchanged_when_used
    if will_save_change_to_case_type_id? && cases.exists?
      errors.add(:case_type, :invalid, message: "cannot change while the step is used by cases")
    end
  end
end
