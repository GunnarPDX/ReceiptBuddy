class CreateReceipts < ActiveRecord::Migration[5.2]
  def change
    create_table :receipts do |t|
      t.string :image
      t.string :total
      t.string :date
      t.string :category
      t.string :certainty
    end
  end
end
