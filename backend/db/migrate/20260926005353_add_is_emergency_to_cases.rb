class AddIsEmergencyToCases < ActiveRecord::Migration[8.1]
  def change
    add_column :cases, :is_emergency, :boolean, default: false, null: false
  end
end
