# frozen_string_literal: true

class CaseSerializer
  include Alba::Resource

  attributes :title, :description, :visibility, :is_emergency, :location_details
  attribute(:id) { |record| record.id.to_s }
  attribute(:created_at) { |record| record.created_at.iso8601(6) }
  attribute(:last_activity_at) { params.fetch(:last_activity_at).iso8601(6) }
  attribute(:confirmation_count) { params.fetch(:confirmation_count) }
  attribute(:confirmed_by_me) { params.fetch(:confirmed_by_me) }
  attribute(:can_confirm) { params.fetch(:can_confirm) }
  one :case_type, resource: CaseTypeSerializer

  trait :list do
    attributes :problem_key
    attribute(:is_creator) { |record| record.creator_id == params.fetch(:user).id }
    one :current_step, resource: StepSerializer

    nested_attribute :classification do
      attribute :status do |record|
        if record.classified_at
          "confirmed"
        else
          "pending"
        end
      end
      attribute(:original_case_type_key) { |record| record.original_case_type_key || record.case_type.key }
      attributes :original_problem_key
      attribute(:confirmed_at) { |record| record.classified_at&.iso8601(6) }
      attribute(:confirmed_by_id) { |record| record.classified_by_id&.to_s }
      attribute(:version) { |record| record.classification_version }
      one :contractor, resource: ContractorSerializer
    end
  end

  trait :dispatch do
    one :house, resource: HouseSerializer
    one :management_company, resource: ManagementCompanySerializer
  end

  trait :details do
    attribute(:workflow) { params.fetch(:workflow) }
    one :house, resource: HouseSerializer
    attribute(:violation_started_at) { |record| record.violation_started_at&.iso8601(6) }
    attribute(:violation_ended_at) { |record| record.violation_ended_at&.iso8601(6) }
    many :photos, source: ->(params) { params.fetch(:photos) } do
      attributes :content_type, :byte_size
      attribute(:id) { |photo| photo.id.to_s }
      attribute(:filename) { |photo| photo.filename.to_s }
      attribute(:url) { |photo| params.fetch(:photo_url).call(photo) }
    end
  end
end
