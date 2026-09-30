class CreateDispatchHouseSelections < ActiveRecord::Migration[8.1]
  def change
    create_table :dispatch_house_selections do |t|
      t.references :user, null: false, index: false, foreign_key: { on_delete: :cascade }
      t.references :house, null: false, foreign_key: { on_delete: :cascade }

      t.timestamps
    end
    add_index :dispatch_house_selections, [ :user_id, :house_id ], unique: true
  end
end
