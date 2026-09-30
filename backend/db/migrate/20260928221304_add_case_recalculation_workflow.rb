# frozen_string_literal: true

class AddCaseRecalculationWorkflow < ActiveRecord::Migration[8.1]
  STATUSES = "'new', 'in_progress', 'action_required', 'closed_by_executor', 'completed'"

  def up
    remove_check_constraint :steps, name: "steps_status_key_valid"
    add_check_constraint :steps, "status_key IN (#{STATUSES}, 'awaiting_recalculation')",
      name: "steps_status_key_valid"
    add_column :cases, :return_reason, :string
    add_check_constraint :cases,
      "return_reason IN ('repair_not_resolved', 'recalculation_missing', 'billing_failed')",
      name: "cases_return_reason_valid"
    execute <<~SQL
      INSERT INTO steps (case_type_id, key, kind, status_key, title, sort_order, created_at, updated_at)
      SELECT id, 'awaiting_recalculation_' || id, 'report', 'awaiting_recalculation',
        'Ожидается перерасчёт',
        COALESCE((SELECT MAX(sort_order) FROM steps WHERE case_type_id = case_types.id), 0) + 1,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      FROM case_types
      WHERE NOT EXISTS (SELECT 1 FROM steps WHERE case_type_id = case_types.id
        AND status_key = 'awaiting_recalculation')
    SQL
    execute <<~SQL
      UPDATE steps SET title = CASE status_key
        WHEN 'action_required' THEN 'Ожидается ответ жителя'
        WHEN 'closed_by_executor' THEN 'Ожидается подтверждение результата' END
      WHERE status_key IN ('action_required', 'closed_by_executor')
    SQL
  end

  def down
    # Existing billing histories and cases must not lose their meaning on rollback.
    raise ActiveRecord::IrreversibleMigration, "Case lifecycle history must be preserved"
  end
end
