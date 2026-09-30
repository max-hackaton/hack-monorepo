# frozen_string_literal: true

require "uri"

class Contractor < ApplicationRecord
  belongs_to :management_company
  has_many :contractor_routings, dependent: :restrict_with_exception
  has_many :cases, dependent: :restrict_with_exception

  normalizes :name, :phone, with: ->(value) { value.strip }
  normalizes :max_url, with: ->(value) { value.strip.presence }
  validates :name, :phone, presence: true, length: { maximum: 255 }
  validates :archived, inclusion: { in: [true, false] }
  validate :max_url_is_https

  private

  def max_url_is_https
    return if max_url.nil?

    uri = URI.parse(max_url)
    unless uri.is_a?(URI::HTTPS) && uri.host.present? && uri.userinfo.nil?
      errors.add(:max_url, "must be an absolute HTTPS URL without credentials")
    end
  rescue URI::InvalidURIError
    errors.add(:max_url, "must be a valid HTTPS URL")
  end
end
