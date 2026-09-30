# frozen_string_literal: true

seed_case_steps = lambda do |case_type|
  case_type.steps.find_or_create_by!(status_key: "new") do |step|
    step.key = "report"
    step.kind = "report"
    step.title = "Новый"
    step.sort_order = case_type.steps.maximum(:sort_order).to_i + 1
  end
  case_type.steps.find_or_create_by!(status_key: "completed") do |step|
    step.key = "complete"
    step.kind = "complete"
    step.title = "Завершено"
    step.sort_order = case_type.steps.maximum(:sort_order).to_i + 1
  end
  {
    "in_progress" => "В работе",
    "action_required" => "Ожидается ответ жителя",
    "closed_by_executor" => "Ожидается подтверждение результата",
    "awaiting_recalculation" => "Ожидается перерасчёт",
  }.each do |status, title|
    case_type.steps.find_or_create_by!(status_key: status) do |step|
      key = status
      key = "dispatch_#{key}" while case_type.steps.exists?(key: key)
      step.key = key
      step.kind = "report"
      step.title = title
      step.sort_order = case_type.steps.maximum(:sort_order).to_i + 1
    end
  end
end

CaseType::CATALOG.each_with_index do |(key, definition), index|
  CaseType.transaction do
    case_type = CaseType.find_or_initialize_by(key: key)
    case_type.update!(
      name: definition.fetch("name"),
      description: definition.fetch("description"),
      sort_order: index,
    )
    seed_case_steps.call(case_type)
  end
end
