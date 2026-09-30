class CreateHomeDomain < ActiveRecord::Migration[8.1]
  def change
    change_table :users do |t|
      t.string :first_name
      t.string :last_name
      t.string :photo_url
    end

    create_table :management_companies do |t|
      t.string :name, null: false
      t.string :inn
      t.string :ogrn
      t.timestamps
    end
    add_index :management_companies, :inn, unique: true
    add_index :management_companies, :ogrn, unique: true

    create_table :houses do |t|
      t.references :management_company, foreign_key: true
      t.string :full_address, null: false
      t.string :max_chat_id, null: false
      t.timestamps
    end
    add_index :houses, :max_chat_id, unique: true
    add_reference :sessions, :house, foreign_key: true

    create_table :case_types do |t|
      t.string :key, null: false
      t.string :name, null: false
      t.string :description
      t.integer :sort_order, null: false, default: 0
      t.timestamps
    end
    add_index :case_types, :key, unique: true

    create_table :steps do |t|
      t.references :case_type, null: false, foreign_key: true
      t.string :key, null: false
      t.string :kind, null: false
      t.string :status_key, null: false
      t.string :title, null: false
      t.string :description
      t.integer :sort_order, null: false
      t.timestamps
    end
    add_index :steps, %i[case_type_id key], unique: true
    add_index :steps, %i[case_type_id sort_order], unique: true
    add_check_constraint :steps,
      "status_key IN ('new', 'in_progress', 'action_required', 'closed_by_executor', 'completed')",
      name: "steps_status_key_valid"

    create_table :cases do |t|
      t.references :house, null: false, foreign_key: true
      t.references :case_type, null: false, foreign_key: true
      t.references :current_step, null: false, foreign_key: { to_table: :steps }
      t.references :creator, null: false, foreign_key: { to_table: :users }
      t.references :management_company, foreign_key: true
      t.string :visibility, null: false
      t.string :location_details
      t.text :description, null: false
      t.datetime :violation_started_at
      t.datetime :violation_ended_at
      t.timestamps
    end
    add_check_constraint :cases, "visibility IN ('public', 'private')",
      name: "cases_visibility_valid"
    add_index :cases, %i[house_id visibility id]

    create_table :case_events do |t|
      t.references :case, null: false, foreign_key: true
      t.references :actor_user, foreign_key: { to_table: :users }
      t.string :event_type, null: false
      t.jsonb :data, null: false, default: {}
      t.datetime :occurred_at, null: false
      t.timestamps
    end
    add_index :case_events, %i[case_id occurred_at]

    create_table :case_confirmations do |t|
      t.references :case, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.datetime :confirmed_at, null: false
      t.timestamps
    end
    add_index :case_confirmations, %i[case_id user_id], unique: true
  end
end
