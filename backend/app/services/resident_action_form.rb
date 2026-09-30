# frozen_string_literal: true

class ResidentActionForm
  def initialize(record)
    @record = record
  end

  # Возвращает хеш формы для указанного действия.
  # Принимает строку или символ.
  def build(action)
    action_sym = action.to_sym
    unless CaseWorkflow::TRANSITIONS[action_sym.to_s]&.first == :resident
      raise ArgumentError, "Unknown action: #{action}"
    end

    label = CaseActionLabels.fetch(action_sym)

    form = {
      action: action_sym.to_s,
      title: label,
      submit_label: label,
      expected_current_step_key: @record.current_step&.key,
      expected_workflow_version: @record.workflow_version,
      fields: fields_for(action_sym),
    }
    if action_sym == :answer_clarification
      question = @record.case_events.where(event_type: "clarification_requested").order(:id).last!
      form[:title] = "Ответить диспетчеру"
      form[:context] = { label: "Вопрос диспетчера", text: question.body }
    end
    form
  end

  private

  def fields_for(action)
    case action
    when :answer_clarification
      [{
        key: "body",
        type: "textarea",
        label: "Ответ на уточнение",
        required: true,
        default_value: "",
        options: [],
      }]
    else
      []
    end
  end
end
