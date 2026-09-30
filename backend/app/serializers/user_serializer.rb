# frozen_string_literal: true

class UserSerializer
  include Alba::Resource

  attributes :first_name, :last_name

  trait :actor do
    attribute(:id) { |user| user.id.to_s }
  end

  trait :viewer do
    attributes :photo_url
  end

  trait :profile do
    attribute(:id) { |user| user.id.to_s }
    attributes :max_user_id, :photo_url
    attribute(:active_role) { params.fetch(:session).active_role }
    attribute(:available_roles) { params.fetch(:session).available_roles }
    one :house, resource: HouseSerializer, source: ->(params) { params[:house] }
  end
end
