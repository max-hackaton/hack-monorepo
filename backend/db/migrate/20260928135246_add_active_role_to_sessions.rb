class AddActiveRoleToSessions < ActiveRecord::Migration[8.1]
  def change
    add_column :sessions, :active_role, :string
    add_check_constraint :sessions, "active_role IN ('resident', 'dispatcher')",
      name: "sessions_active_role_valid"
  end
end
