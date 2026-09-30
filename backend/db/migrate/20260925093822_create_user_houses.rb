class CreateUserHouses < ActiveRecord::Migration[8.1]
  def change
    create_table :user_houses do |t|
      t.references :user, null: false, foreign_key: true
      t.references :house, null: false, foreign_key: true

      t.timestamps
    end
    add_index :user_houses, [ :user_id, :house_id ], unique: true
  end
end
