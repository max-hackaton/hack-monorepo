# frozen_string_literal: true

class CaseClassification
  def initialize(record)
    @record = record
  end

  def available_contractors
    return Contractor.none unless @record.classified_at

    ContractorCandidatesQuery.new(
      @record,
      case_type: @record.case_type,
      problem_key: @record.problem_key,
    ).call
  end

  def confirm!(actor:, case_type:, problem_key:, expected_version:, is_emergency: nil)
    @record.with_lock do
      ensure_mutable!(actor)
      previous_category = category_snapshot
      selection = previous_category.merge(
        case_type_key: case_type.key,
        problem_key: problem_key,
      )
      selection[:is_emergency] = is_emergency unless is_emergency.nil?
      if @record.classified_at && previous_category == selection
        next @record
      end

      ensure_version!(expected_version)
      previous_contractor = @record.contractor
      previous_case_type_name = @record.case_type.name
      update_category!(actor, case_type, selection)
      @record.case_events.record_classification!(
        actor: actor,
        from: previous_category.merge(case_type_name: previous_case_type_name),
        to: selection.merge(case_type_name: case_type.name),
        occurred_at: @record.classified_at,
      )
      if previous_contractor&.id != @record.contractor_id
        @record.case_events.record_assignment!(
          actor: actor, previous: previous_contractor, contractor: @record.contractor,
        )
      end
      if @record.current_step.status_key == "new"
        CaseWorkflow.new(@record).perform!(
          action: "start_work",
          actor: actor,
          role: :dispatcher,
          expected_current_step_key: @record.current_step.key,
        )
      end
      @record
    end
  end

  def assign!(actor:, contractor_id:, expected_version:)
    @record.with_lock do
      ensure_mutable!(actor)
      reject!("Confirm the category first") unless @record.classified_at
      next @record if @record.contractor_id == contractor_id

      ensure_version!(expected_version)
      selected = available_contractors.find(contractor_id)
      lock_contractor!(selected)
      previous = @record.contractor
      @record.update!(
        contractor: selected,
        classification_version: @record.classification_version + 1,
      )
      @record.case_events.record_assignment!(actor: actor, previous: previous, contractor: selected)
      @record
    end
  end

  private

  def update_category!(actor, type, selection)
    selected = select_contractor(type, selection.fetch(:problem_key))
    lock_contractor!(selected)
    unless @record.classified_at
      @record.original_case_type_key = @record.case_type.key
      @record.original_problem_key = @record.problem_key
    end
    @record.update!(
      case_type: type,
      problem_key: selection.fetch(:problem_key),
      is_emergency: selection.fetch(:is_emergency),
      current_step: CaseWorkflow.new(@record).step_for(type),
      classified_at: Time.current,
      classified_by: actor,
      contractor: selected,
      classification_version: @record.classification_version + 1,
      workflow_version: @record.workflow_version + 1,
    )
  end

  def select_contractor(type, problem_key)
    same_category = @record.case_type_id == type.id && @record.problem_key == problem_key
    if @record.classified_at && same_category
      return @record.contractor
    end

    ContractorCandidatesQuery.new(@record, case_type: type, problem_key: problem_key)
      .preferred(current: @record.contractor)
  end

  def lock_contractor!(contractor)
    return unless contractor

    contractor.lock!
    reject!("Contractor is archived") if contractor.archived?
  end

  def ensure_mutable!(actor)
    unless actor.dispatch_companies.exists?(id: @record.management_company_id)
      raise ActiveRecord::RecordNotFound
    end
    if @record.current_step.status_key.in?(["completed", "closed_by_executor", "awaiting_recalculation"])
      reject!("Closed case cannot be classified or assigned")
    end
  end

  def ensure_version!(expected)
    unless expected == @record.classification_version
      raise ActiveRecord::StaleObjectError.new(@record, "classify")
    end
  end

  def reject!(message)
    @record.errors.add(:base, message)
    raise ActiveRecord::RecordInvalid, @record
  end

  def category_snapshot
    {
      case_type_key: @record.case_type.key,
      problem_key: @record.problem_key,
      is_emergency: @record.is_emergency,
    }
  end
end
