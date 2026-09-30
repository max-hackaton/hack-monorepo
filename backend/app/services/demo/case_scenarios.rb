# frozen_string_literal: true

require "yaml"

module Demo
  class CaseScenarios
    SCENARIOS = YAML.safe_load_file(Rails.root.join("db/seeds/case_scenarios.yml")).freeze
    NEIGHBORS = [
      ["Мария", "Соколова"],
      ["Алексей", "Петров"],
      ["Ольга", "Иванова"],
      ["Дмитрий", "Волков"],
      ["Елена", "Морозова"],
      ["Сергей", "Кузнецов"],
      ["Наталья", "Лебедева"],
      ["Андрей", "Попов"],
      ["Татьяна", "Орлова"],
      ["Михаил", "Фёдоров"],
      ["Ирина", "Павлова"],
      ["Павел", "Семёнов"],
      ["Светлана", "Белова"],
      ["Виктор", "Новиков"],
      ["Анна", "Захарова"],
      ["Роман", "Васильев"],
      ["Юлия", "Козлова"],
      ["Игорь", "Егоров"],
      ["Ксения", "Макарова"],
      ["Владимир", "Андреев"],
    ].freeze

    def initialize(house:, resident:, dispatcher:, namespace:)
      @house = house
      @resident = resident
      @dispatcher = dispatcher
      @namespace = namespace
    end

    def call(scenarios: SCENARIOS)
      started_at = Time.current.change(usec: 0)
      BillingRoute::DEFAULT_ADAPTERS.each do |key, adapter|
        BillingRoute.find_or_create_by!(house: @house, case_type: CaseType.find_by!(key: key)) do |route|
          route.adapter = adapter
        end
      end
      @neighbors = NEIGHBORS.each_with_index.map do |(first_name, last_name), index|
        id = index.zero? ? "#{@namespace}_neighbor" : "#{@namespace}_neighbor_#{index + 1}"
        user = User.find_or_initialize_by(max_user_id: id)
        if user.first_name.blank? || user.first_name == "Сосед"
          user.assign_attributes(first_name: first_name, last_name: last_name)
        end
        user.save! if user.changed?
        user.user_houses.find_or_create_by!(house: @house) { |link| link.verified_at = Time.current }
        user
      end
      scenarios.to_a.reverse_each.with_index do |(key, scenario), index|
        last_activity_before = started_at - (scenarios.size - index - 1).hours
        seed_scenario(key, scenario, last_activity_before: last_activity_before)
      end
    end

    private

    def seed_scenario(key, scenario, last_activity_before:)
      creator = scenario["creator"] == "neighbor" ? @neighbors.first : @resident
      existing = find_existing(key, scenario, creator)
      if existing
        mark_creation(existing, key)
        ScenarioPhotos.attach(existing, scenario["photos"])
        return
      end

      Case.transaction do
        record = report_case(scenario, creator)
        mark_creation(record, key)
        ScenarioPhotos.attach(record, scenario["photos"])
        add_subscriptions(record, scenario)
        actions = scenario.fetch("actions")
        classify_case(record) if actions.any?
        actions.each { |action| perform_action(record, action) }
        ScenarioTimeline.new(record).call(last_activity_before: last_activity_before)
      end
    end

    def find_existing(key, scenario, creator)
      scope = @house.cases.where(creator: creator)
      marked = scope.joins(:case_events)
        .find_by("case_events.data ->> 'seed_key' = ?", "#{@namespace}:#{key}")
      marked || scope.find_by(description: [scenario.fetch("description"), scenario["legacy_description"]].compact)
    end

    def mark_creation(record, key)
      event = record.case_events.find_or_initialize_by(event_type: "case_created")
      if event.new_record?
        event.assign_attributes(actor_user: record.creator, occurred_at: record.created_at)
      end
      event.data = event.data.merge("seed_key" => "#{@namespace}:#{key}")
      event.save! if event.changed?
    end

    def report_case(scenario, creator)
      Case.report!(
        house: @house,
        creator: creator,
        case_type: CaseType.find_by!(key: scenario.fetch("case_type")),
        problem_key: scenario.fetch("problem"),
        description: scenario.fetch("description"),
        location_details: scenario.fetch("location"),
        visibility: scenario.fetch("visibility"),
        is_emergency: scenario.fetch("emergency", false),
        created_at: 3.days.ago,
        violation_started_at: 3.days.ago,
      )
    end

    def add_subscriptions(record, scenario)
      return unless record.visibility == "public"

      subscribers = scenario["subscribed"] ? [@resident] : []
      count = scenario.fetch("subscribers", 0)
      subscribers += @neighbors.reject { |user| user == record.creator }.first(count - subscribers.size)
      subscribers.each { |user| CaseConfirmation.confirm!(record, user: user) }
    end

    def classify_case(record)
      contractor = ContractorCandidatesQuery.new(
        record, case_type: record.case_type, problem_key: record.problem_key
      ).call.first
      classification = CaseClassification.new(record)
      classification.confirm!(
        actor: @dispatcher,
        case_type: record.case_type,
        problem_key: record.problem_key,
        expected_version: record.classification_version,
      )
      return unless contractor

      classification.assign!(
        actor: @dispatcher,
        contractor_id: contractor.id,
        expected_version: record.classification_version,
      )
    end

    def perform_action(record, action)
      role = action.fetch("role", "dispatcher")
      actor = role == "resident" ? record.creator : @dispatcher
      if action["action"] || action["status"] == "action_required"
        CaseWorkflow.new(record).perform!(
          action: action["action"] || "request_clarification",
          actor: actor,
          role: role.to_sym,
          body: action["body"],
          expected_current_step_key: record.current_step.key,
        )
        return
      end
      if action["body"]
        CaseEvent.add_message!(record, actor: actor, body: action.fetch("body"), sender_role: role)
      end
      if action["status"] && action["status"] != record.current_step.status_key
        CaseWorkflow.new(record).transition_to!(
          actor: actor,
          step: record.case_type.steps.find_by!(status_key: action.fetch("status")),
          role: role.to_sym,
          expected_current_step_key: record.current_step.key,
        )
      end
    end
  end
end
