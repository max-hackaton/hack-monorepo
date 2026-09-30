# frozen_string_literal: true

class CreateRecalculationRequests < ActiveRecord::Migration[8.1]
  def change
    create_table :recalculation_requests do |t|
      t.references :case, null: false, foreign_key: true
      t.references :billing_route, null: false, foreign_key: true
      t.string :adapter, null: false
      t.string :status, null: false, default: "pending"
      t.string :external_id
      t.jsonb :payload, null: false
      t.datetime :submitted_at
      t.text :transmission_error

      t.timestamps
    end
    add_index :recalculation_requests, :case_id, unique: true,
      where: "status = 'pending'", name: "one_pending_recalculation_per_case"
    add_check_constraint :recalculation_requests, "status IN ('pending', 'submitted', 'failed')",
      name: "recalculation_requests_status_valid"
    add_check_constraint :recalculation_requests, "jsonb_typeof(payload) = 'object'",
      name: "recalculation_requests_payload_object"
    add_check_constraint :recalculation_requests,
      "status <> 'submitted' OR (external_id IS NOT NULL AND submitted_at IS NOT NULL)",
      name: "recalculation_requests_receipt_present"
    add_check_constraint :recalculation_requests, "status <> 'failed' OR transmission_error IS NOT NULL",
      name: "recalculation_requests_failure_present"
  end
end
