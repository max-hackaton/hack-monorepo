# frozen_string_literal: true

class CaseWorkflowPresentation
  def initialize(record)
    @record = record
  end

  def detail(role:)
    available_actions = CaseWorkflow.new(@record).available_actions(role: role)
    {
      version: @record.workflow_version,
      available_actions: available_actions,
      available_action_labels: available_actions.index_with { |action| CaseActionLabels.fetch(action) },
      return_reason: @record.return_reason,
      clarification: clarification,
      recalculation_requests: RecalculationRequestSerializer.new(@record.recalculation_requests.order(:id)).as_json,
    }
  end

  private

  def clarification
    question = @record.case_events.where(event_type: "clarification_requested").order(:id).last
    return unless question

    answer = @record.case_events.where(event_type: "clarification_answered")
      .where("data ->> 'question_id' = ?", question.id.to_s).order(:id).last
    { id: question.id.to_s, question: question.body, answer: answer&.body }
  end
end
