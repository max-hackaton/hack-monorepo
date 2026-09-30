# frozen_string_literal: true

class UserHouse < ApplicationRecord
  belongs_to :user
  belongs_to :house

  class << self
    def verify!(user:, house:)
      if user.demo_account? || house.demo? || house.legacy_development?
        return user.house_access?(house)
      end

      user.with_lock do
        checked_at = Time.current
        allowed = Max::ChatMembership.new.member?(
          chat_id: house.max_chat_id,
          user_id: user.max_user_id,
        )
        if allowed
          membership = user.user_houses.find_or_initialize_by(house: house)
          membership.update!(verified_at: checked_at)
        else
          remove!(user: user, house: house)
        end
        allowed
      end
    end

    def revoke!(user:, house:, removed_at:)
      user.with_lock do
        membership = user.user_houses.find_by(house: house)
        if membership&.verified_at && membership.verified_at >= removed_at + 0.001
          return false
        end

        remove!(user: user, house: house)
        true
      end
    end

    private

    def remove!(user:, house:)
      user.user_houses.where(house: house).delete_all
      user.sessions.where(house: house).update_all(house_id: nil)
    end
  end
end
