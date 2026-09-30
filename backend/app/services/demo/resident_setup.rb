# frozen_string_literal: true

module Demo
  class ResidentSetup
    def initialize(user)
      @user = user
    end

    def call(selected_house)
      return unless selected_house&.demo?
      return unless @user.max_user_id.match?(/\A[1-9]\d*\z/)

      house = House.find_by(max_chat_id: House::DEMO_CHAT_ID)
      dispatcher = User.find_by(max_user_id: "demo_dispatcher")
      return unless house && dispatcher
      return unless dispatcher.management_company_memberships.exists?(management_company: house.management_company)
      return unless marked_cases(house).exists?
      return if marked_cases(house).where(creator: @user).exists?

      @user.with_lock do
        return if marked_cases(house).where(creator: @user).exists?

        House.where(max_chat_id: House::DEMO_CHAT_IDS.first(3)).find_each do |demo_house|
          @user.user_houses.find_or_create_by!(house: demo_house)
        end
        subscribe_to_examples(house)
        personal = CaseScenarios::SCENARIOS.reject { |_key, scenario| scenario["creator"] == "neighbor" }
        CaseScenarios.new(house: house, resident: @user, dispatcher: dispatcher, namespace: "demo")
          .call(scenarios: personal)
      end
    end

    private

    def marked_cases(house)
      house.cases.joins(:case_events).where(
        "case_events.event_type = ? AND case_events.data ->> 'seed_key' = ?", "case_created", "demo:new_resident"
      )
    end

    def subscribe_to_examples(house)
      keys = CaseScenarios::SCENARIOS.filter_map { |key, scenario| "demo:#{key}" if scenario["subscribed"] }
      house.cases.publicly_visible.active.joins(:case_events)
        .where("case_events.data ->> 'seed_key' IN (?)", keys).find_each do |record|
          CaseConfirmation.confirm!(record, user: @user)
        end
    end
  end
end
