class CreateContractors < ActiveRecord::Migration[8.1]
  def change
    create_table :contractors do |t|
      t.references :management_company, null: false, foreign_key: true
      t.string :name, null: false
      t.string :phone, null: false
      t.string :max_url
      t.boolean :archived, default: false, null: false
      t.timestamps
    end
    add_index :contractors, [ :id, :management_company_id ], unique: true
    add_check_constraint :contractors, "btrim(name) <> '' AND btrim(phone) <> ''", name: "contractors_contact_present"
  end
end
