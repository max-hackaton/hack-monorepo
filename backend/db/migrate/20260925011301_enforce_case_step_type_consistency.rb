class EnforceCaseStepTypeConsistency < ActiveRecord::Migration[8.1]
  def change
    add_index :steps, %i[id case_type_id], unique: true

    remove_foreign_key :cases, :steps, column: :current_step_id
    add_foreign_key :cases, :steps,
      column: %i[current_step_id case_type_id], primary_key: %i[id case_type_id],
      name: "fk_cases_current_step_case_type"
  end
end
