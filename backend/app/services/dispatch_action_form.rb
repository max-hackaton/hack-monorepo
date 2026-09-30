# frozen_string_literal: true

class DispatchActionForm
  MUTABLE_STATUSES = ["new", "in_progress", "action_required"].freeze

  def initialize(record)
    @record = record
  end

  def summary
    kind, action = next_action
    {
      label: label_for(kind, action),
      enabled: !kind.nil?,
      can_change_classification: editable? && @record.classified_at.present?,
      can_change_contractor: can_change_contractor?,
    }
  end

  def transitions
    return [special_transition("classification", "Проверить категорию")] if editable? && !@record.classified_at
    if editable? && @record.classified_at && !@record.contractor && contractors.size > 1
      return [special_transition("assignment", "Выбрать исполнителя")]
    end

    available_actions.filter_map do |action|
      next if action == "request_clarification"

      target_status = CaseWorkflow::TRANSITIONS.fetch(action)[2]
      target = @record.case_type.steps.find_by!(status_key: target_status)
      {
        key: action,
        label: CaseActionLabels.fetch(action),
        target_step_key: target.key,
        target_status_key: target_status,
      }
    end
  end

  def form(intent:, transition_key: nil)
    kind, action = if intent == "advance"
      transition = transitions.find { |item| item.fetch(:key) == transition_key }
      if transition
        if transition_key == "classification"
          ["classification", nil]
        elsif transition_key == "assignment"
          ["assignment", nil]
        else
          ["workflow", transition_key]
        end
      end
    elsif intent == "clarification"
      ["workflow", "request_clarification"] if available_actions.include?("request_clarification")
    elsif intent == "change_classification"
      ["classification", nil] if editable?
    elsif intent == "change_contractor"
      ["assignment", nil] if can_change_contractor?
    end
    raise ActiveRecord::RecordInvalid, @record unless kind

    {
      kind: kind,
      action: action,
      title: label_for(kind, action, intent: intent),
      submit_label: kind == "classification" ? "Подтвердить категорию" : label_for(kind, action, intent: intent),
      expected_current_step_key: @record.current_step.key,
      expected_workflow_version: @record.workflow_version,
      expected_classification_version: @record.classification_version,
      fields: fields_for(kind, action),
    }
  end

  private

  def special_transition(key, label)
    { key: key, label: label, target_step_key: nil, target_status_key: nil }
  end

  def available_actions
    CaseWorkflow.new(@record).available_actions(role: :dispatcher)
  end

  def next_action
    return ["classification", nil] if editable? && !@record.classified_at
    return ["assignment", nil] if editable? && @record.classified_at && !@record.contractor && contractors.size > 1

    action = available_actions.find { |name| name != "request_clarification" }
    ["workflow", action] if action
  end

  def editable?
    MUTABLE_STATUSES.include?(@record.current_step.status_key)
  end

  def contractors
    @contractors ||= CaseClassification.new(@record).available_contractors.to_a
  end

  def can_change_contractor?
    editable? && @record.classified_at.present? &&
      contractors.any? { |contractor| contractor.id != @record.contractor_id }
  end

  def label_for(kind, action, intent: "advance")
    return "Ожидаем следующий шаг" unless kind
    return intent == "change_classification" ? "Изменить категорию" : "Проверить категорию" if kind == "classification"
    return @record.contractor ? "Изменить исполнителя" : "Выбрать исполнителя" if kind == "assignment"
    CaseActionLabels.fetch(action)
  end

  def fields_for(kind, action)
    return classification_fields if kind == "classification"
    return assignment_fields if kind == "assignment"
    return [{
      key: "body",
      type: "textarea",
      label: "Вопрос жителю",
      required: true,
      default_value: "",
      options: [],
    }] if action == "request_clarification"

    []
  end

  def classification_fields
    types = CaseType.for_creation.to_a
    category_options = types.map { |type| option(type.key, type.name) }
    problem_options = types.flat_map do |type|
      field = type.constructor.fetch("fields").find { |item| item.fetch("key") == "problem" }
      field.fetch("options").map { |item| option(item.fetch("key"), item.fetch("label"), type.key) }
    end
    [
      {
        key: "case_type_key",
        type: "select",
        label: "Категория",
        required: true,
        default_value: @record.case_type.key,
        options: category_options,
      },
      {
        key: "problem_key",
        type: "select",
        label: "Тип проблемы",
        required: true,
        default_value: @record.problem_key,
        depends_on: "case_type_key",
        options: problem_options,
      },
      {
        key: "is_emergency",
        type: "boolean",
        label: "Аварийная ситуация",
        required: true,
        default_value: @record.is_emergency,
        options: [],
      },
    ]
  end

  def assignment_fields
    [{
      key: "contractor_id",
      type: "select",
      label: "Исполнитель",
      required: true,
      default_value: @record.contractor_id&.to_s,
      options: contractors.map { |item| option(item.id.to_s, item.name) },
    }]
  end

  def option(value, label, parent_key = nil)
    { value: value, label: label, parent_key: parent_key }
  end
end
