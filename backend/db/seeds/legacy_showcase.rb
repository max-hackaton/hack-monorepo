# frozen_string_literal: true

class LegacyShowcaseSeeds
  class << self
    def migrate
      legacy_ids = House::DEMO_CHAT_IDS.map { |id| id.sub("__DEMO_", "__DEV_") }
      houses = House.where(max_chat_id: legacy_ids)
      return unless houses.exists?

      House.transaction do
        houses.find_each do |house|
          house.update!(max_chat_id: house.max_chat_id.sub("__DEV_", "__DEMO_"))
          CaseEvent.where(case_id: house.cases.select(:id), event_type: "case_created").find_each do |event|
            key = event.data["seed_key"]
            next unless key&.start_with?("dev:")

            event.update!(data: event.data.merge("seed_key" => key.sub("dev:", "demo:")))
          end
        end
        ids = ["dev", "dev_dispatcher", "dev_neighbor", *(2..20).map { |number| "dev_neighbor_#{number}" }]
        User.where(max_user_id: ids).find_each do |user|
          id = user.max_user_id == "dev" ? User::DEMO_MAX_USER_ID : user.max_user_id.sub("dev_", "demo_")
          user.update!(max_user_id: id)
        end
      end
    end
  end
end
