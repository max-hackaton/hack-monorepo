class AddClassificationToCases < ActiveRecord::Migration[8.1]
  def change
    add_column :cases, :problem_key, :string
    add_column :cases, :original_case_type_key, :string
    add_column :cases, :original_problem_key, :string
    add_column :cases, :classified_at, :datetime
    add_reference :cases, :classified_by, foreign_key: { to_table: :users }
    add_reference :cases, :contractor, foreign_key: true
    add_column :cases, :classification_version, :integer, default: 0, null: false
    add_foreign_key :cases, :contractors,
      column: [ :contractor_id, :management_company_id ], primary_key: [ :id, :management_company_id ]
    add_check_constraint :cases,
      "(classified_at IS NULL AND classified_by_id IS NULL) OR (classified_at IS NOT NULL AND classified_by_id IS NOT NULL AND problem_key IS NOT NULL)",
      name: "cases_classification_complete"
    add_check_constraint :cases,
      "contractor_id IS NULL OR (classified_at IS NOT NULL AND management_company_id IS NOT NULL)", name: "cases_assignment_classified"
    add_check_constraint :cases, "classification_version >= 0", name: "cases_classification_version_valid"
    reversible do |direction|
      direction.up do
        execute <<~SQL
          UPDATE cases SET original_case_type_key = case_types.key
          FROM case_types WHERE cases.case_type_id = case_types.id
        SQL
      end
    end
  end
end
