class CreateContractorRoutings < ActiveRecord::Migration[8.1]
  def change
    create_table :contractor_routings do |t|
      t.references :management_company, null: false, foreign_key: true
      t.references :contractor, null: false, foreign_key: true
      t.references :case_type, null: false, foreign_key: true
      t.references :house, foreign_key: true
      t.string :problem_key, null: false
      t.timestamps
    end
    add_index :houses, [ :id, :management_company_id ], unique: true
    add_foreign_key :contractor_routings, :contractors,
      column: [ :contractor_id, :management_company_id ], primary_key: [ :id, :management_company_id ]
    add_foreign_key :contractor_routings, :houses,
      column: [ :house_id, :management_company_id ], primary_key: [ :id, :management_company_id ]
    add_index :contractor_routings, [ :contractor_id, :case_type_id, :problem_key ],
      unique: true, where: "house_id IS NULL", name: "index_contractor_routings_company_unique"
    add_index :contractor_routings, [ :contractor_id, :case_type_id, :problem_key, :house_id ],
      unique: true, where: "house_id IS NOT NULL", name: "index_contractor_routings_house_unique"
    add_index :contractor_routings, [ :management_company_id, :case_type_id, :problem_key, :house_id ],
      name: "index_contractor_routings_lookup"
    add_check_constraint :contractor_routings, "btrim(problem_key) <> ''", name: "contractor_routings_problem_present"
  end
end
