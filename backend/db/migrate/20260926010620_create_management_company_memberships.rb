class CreateManagementCompanyMemberships < ActiveRecord::Migration[8.1]
  def change
    create_table :management_company_memberships do |t|
      t.references :user, null: false, foreign_key: true
      t.references :management_company, null: false, foreign_key: true

      t.timestamps
    end

    add_index :management_company_memberships, [ :user_id, :management_company_id ], unique: true
  end
end
