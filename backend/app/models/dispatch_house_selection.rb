# frozen_string_literal: true

class DispatchHouseSelection < ApplicationRecord
  belongs_to :user
  belongs_to :house

  class << self
    def select_demo_default_for(user, house)
      return unless house
      return unless house.management_company_id == House.demo.management_company_id

      user.with_lock do
        return if user.dispatch_house_selections.exists?
        return unless House.for_dispatcher(user).exists?(id: house.id)

        user.dispatch_house_selections.create!(house: house)
      end
    end

    def replace_for(user, house_ids)
      user.with_lock do
        accessible_house_count = House.for_dispatcher(user)
          .where(id: house_ids)
          .count
        return false if accessible_house_count != house_ids.size

        selections = user.dispatch_house_selections
        selections.where.not(house_id: house_ids).delete_all

        existing_house_ids = selections.pluck(:house_id)
        added_house_ids = house_ids - existing_house_ids

        if added_house_ids.any?
          new_selections = added_house_ids.map do |house_id|
            { house_id: house_id }
          end

          selections.insert_all(new_selections)
        end

        true
      end
    end
  end
end
