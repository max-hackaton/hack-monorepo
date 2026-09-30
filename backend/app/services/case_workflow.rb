# frozen_string_literal: true

class CaseWorkflow
  TRANSITIONS = {
    "start_work" => [:dispatcher, ["new"], "in_progress", "work_started"],
    "request_clarification" => [
      :dispatcher, ["new", "in_progress", "action_required"], "action_required", "clarification_requested",
    ],
    "answer_clarification" => [:resident, ["action_required"], "in_progress", "clarification_answered"],
    "finish_work" => [:dispatcher, ["in_progress"], "closed_by_executor", "work_finished"],
    "confirm_repair" => [:resident, ["closed_by_executor"], "completed", "repair_confirmed"],
    "reject_repair" => [:resident, ["closed_by_executor"], "in_progress", "repair_rejected"],
    "confirm_recalculation" => [:resident, ["awaiting_recalculation"], "completed", "recalculation_confirmed"],
    "reject_recalculation" => [:resident, ["awaiting_recalculation"], "in_progress", "recalculation_missing"],
    "retry_recalculation" => [:dispatcher, ["in_progress"], "awaiting_recalculation", "recalculation_retried"],
    "resume_recalculation" => [
      :dispatcher,
      ["awaiting_recalculation"],
      "awaiting_recalculation",
      "recalculation_resumed",
    ],
  }.freeze

  def initialize(record)
    @record = record
  end

  def available_actions(role:)
    TRANSITIONS.filter_map do |action, (actor_role, sources, _target, _event)|
      action if actor_role == role && sources.include?(@record.current_step.status_key) && allowed_context?(action)
    end
  end

  def available_steps
    statuses = available_actions(role: :dispatcher).filter_map do |action|
      TRANSITIONS.fetch(action)[2] if action.in?(["start_work", "finish_work"])
    end
    @record.case_type.steps.where(status_key: statuses).order(:sort_order, :id)
  end

  def perform!(action:, actor:, role:, expected_current_step_key:,
    expected_workflow_version: @record.workflow_version, body: nil)
    request = nil
    @record.with_lock do
      authorize!(actor, role)
      if @record.current_step.key != expected_current_step_key || @record.workflow_version != expected_workflow_version
        raise ActiveRecord::StaleObjectError.new(@record, "update")
      end
      reject_transition! unless available_actions(role: role).include?(action)
      previous = @record.current_step
      target, data, request = Action.new(@record).apply!(action, body: body)
      step = @record.case_type.steps.find_by!(status_key: target)
      @record.update!(current_step: step, workflow_version: @record.workflow_version + 1)
      @record.case_events.create!(
        actor_user: actor,
        event_type: TRANSITIONS.fetch(action)[3],
        occurred_at: Time.current,
        data: data.merge(from_status_key: previous.status_key, to_status_key: step.status_key),
      )
    end
    Billing::Submission.new(request).call if request
    @record.reload
  end

  def step_for(case_type)
    return @record.current_step if @record.case_type_id == case_type.id

    steps = case_type.steps.where(status_key: @record.current_step.status_key).limit(2).to_a
    reject_transition! unless steps.one?
    steps.first
  end

  def transition_to!(actor:, step:, role: :resident, expected_current_step_key: nil,
    expected_workflow_version: @record.workflow_version)
    reject_transition! unless step.case_type_id == @record.case_type_id
    action = if role == :dispatcher
      { "in_progress" => "start_work", "closed_by_executor" => "finish_work" }[step.status_key]
    else
      { "in_progress" => "reject_repair", "completed" => "confirm_repair" }[step.status_key]
    end
    perform!(
      action: action,
      actor: actor,
      role: role,
      expected_current_step_key: expected_current_step_key || @record.current_step.key,
      expected_workflow_version: expected_workflow_version,
    )
  end

  def resume_after_resident_message!(actor:)
    @record.with_lock do
      previous = @record.current_step
      next @record unless actor.id == @record.creator_id && previous.status_key == "action_required"

      # Recorded questions require the versioned answer action, so old notes cannot answer a newer question.
      next @record if @record.case_events.exists?(event_type: "clarification_requested")

      step = @record.case_type.steps.find_by!(status_key: "in_progress")
      @record.update!(current_step: step, workflow_version: @record.workflow_version + 1)
      @record.case_events.create!(
        actor_user: actor,
        event_type: "status_changed",
        occurred_at: Time.current,
        data: {
          from_step_key: previous.key,
          to_step_key: step.key,
          from_status_key: previous.status_key,
          to_status_key: step.status_key,
        },
      )
      @record
    end
  end

  private

  def allowed_context?(action)
    case action
    when "request_clarification"
      @record.current_step.status_key != "action_required" ||
        !@record.case_events.exists?(event_type: "clarification_requested")
    when "answer_clarification"
      @record.case_events.exists?(event_type: "clarification_requested")
    when "resume_recalculation"
      @record.recalculation_requests.order(:id).last&.status == "pending"
    when "retry_recalculation"
      @record.return_reason.in?(["recalculation_missing", "billing_failed"]) &&
        @record.recalculation_requests.order(:id).last&.status.in?(["submitted", "failed"])
    when "confirm_recalculation", "reject_recalculation"
      @record.recalculation_requests.order(:id).last&.status == "submitted"
    when "finish_work"
      !@record.return_reason.in?(["recalculation_missing", "billing_failed"])
    else
      true
    end
  end

  def authorize!(actor, role)
    authorized = if role == :dispatcher
      actor.dispatch_companies.exists?(id: @record.management_company_id)
    else
      role == :resident && actor.id == @record.creator_id
    end
    raise ActiveRecord::RecordNotFound unless authorized
  end

  def reject_transition!
    @record.errors.add(:base, "Status transition is not allowed")
    raise ActiveRecord::RecordInvalid, @record
  end
end
