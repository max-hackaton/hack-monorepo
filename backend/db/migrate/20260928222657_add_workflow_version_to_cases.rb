# frozen_string_literal: true

class AddWorkflowVersionToCases < ActiveRecord::Migration[8.1]
  def change
    add_column :cases, :workflow_version, :integer, null: false, default: 0
    add_check_constraint :cases, "workflow_version >= 0", name: "cases_workflow_version_valid"
  end
end
