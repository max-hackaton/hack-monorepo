# frozen_string_literal: true

class Case < ApplicationRecord
  PHOTO_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"].freeze
  MAX_PHOTOS = 5
  MAX_PHOTO_BYTES = 10.megabytes

  belongs_to :contractor, optional: true
  belongs_to :classified_by, class_name: "User", optional: true
  belongs_to :house
  belongs_to :case_type
  belongs_to :current_step, class_name: "Step"
  belongs_to :creator, class_name: "User"
  belongs_to :management_company, optional: true
  has_many :case_events, dependent: :restrict_with_exception
  has_many :case_confirmations, dependent: :restrict_with_exception
  has_many :recalculation_requests, dependent: :restrict_with_exception
  has_many_attached :photos

  validates :visibility, inclusion: { in: ["public", "private"] }
  validates :is_emergency, inclusion: { in: [true, false] }
  validates :description, presence: true
  validate :problem_is_a_constructor_choice
  validate :current_step_matches_case_type
  validate :violation_period_is_ordered
  validate :photos_are_supported

  class << self
    def publicly_visible
      where(visibility: "public")
    end

    def visible_to(user)
      public_cases = where(visibility: "public")
      own_cases = where(creator: user)
      public_cases.or(own_cases)
    end

    def active
      joins(:current_step).where.not(steps: { status_key: "completed" })
    end

    def report!(house:, creator:, case_type:, **attributes)
      first_step = case_type.steps.order(:sort_order).first

      transaction do
        record = create!(
          **attributes,
          original_case_type_key: case_type.key,
          original_problem_key: attributes[:problem_key],
          house: house,
          creator: creator,
          case_type: case_type,
          current_step: first_step,
          management_company: house.management_company,
        )
        event = record.case_events.create!(
          actor_user: creator,
          event_type: "case_created",
          occurred_at: record.created_at,
        )
        if record.visibility == "public" && house.max_chat_id.match?(/\A-?\d+\z/)
          PublishCaseToChatJob.perform_later(event.id)
        end
        record
      end
    end
  end

  def title
    case_type.problem_option(problem_key)&.fetch("text")&.presence || case_type.name
  end

  def completed?
    current_step.status_key == "completed"
  end

  def confirmable_by?(user)
    visibility == "public" && creator_id != user.id && !completed?
  end

  private

  def problem_is_a_constructor_choice
    unless problem_key.nil? || case_type&.problem_option(problem_key)
      errors.add(:problem_key, "is not a constructor choice")
    end
  end

  def photos_are_supported
    if photos.size > MAX_PHOTOS
      errors.add(:photos, "must contain at most #{MAX_PHOTOS} files")
    end
    photos.blobs.each do |blob|
      unless PHOTO_CONTENT_TYPES.include?(blob.content_type)
        errors.add(:photos, "must be JPEG, PNG, WebP, HEIC or HEIF images")
      end
      if blob.byte_size > MAX_PHOTO_BYTES
        errors.add(:photos, "must be at most 10 MiB each")
      end
    end
  end

  def current_step_matches_case_type
    if current_step && case_type && current_step.case_type_id != case_type.id
      errors.add(:current_step, "must belong to the same case type")
    end
  end

  def violation_period_is_ordered
    if violation_started_at && violation_ended_at && violation_ended_at <= violation_started_at
      errors.add(:violation_ended_at, "must be after violation started at")
    end
  end
end
