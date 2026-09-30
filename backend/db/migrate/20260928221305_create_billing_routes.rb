# frozen_string_literal: true

class CreateBillingRoutes < ActiveRecord::Migration[8.1]
  def change
    create_table :billing_routes do |t|
      t.references :house, null: false, foreign_key: true
      t.references :case_type, null: false, foreign_key: true
      t.string :adapter, null: false

      t.timestamps
    end
    add_index :billing_routes, [:house_id, :case_type_id], unique: true
    add_check_constraint :billing_routes, "adapter IN ('uk', 'rko')", name: "billing_routes_adapter_valid"
  end
end
