import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';

interface InventoryAttributes {
  id: number;
  id_product: number;
  quantity_in: number;
  quantity_out: number;
  current_stock: number;
  movement_type: 'IN' | 'OUT' | 'ADJUSTMENT';
  reference_id: number | null;
  description: string | null;
  movement_date: Date;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

type InventoryCreationAttributes = Optional<
  InventoryAttributes,
  'id' | 'created_at' | 'updated_at' | 'deleted_at'
>;

export class Inventory
  extends Model<InventoryAttributes, InventoryCreationAttributes>
  implements InventoryAttributes
{
  public id!: number;
  public id_product!: number;
  public quantity_in!: number;
  public quantity_out!: number;
  public current_stock!: number;
  public movement_type!: 'IN' | 'OUT' | 'ADJUSTMENT';
  public reference_id!: number | null;
  public description!: string | null;
  public movement_date!: Date;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at!: Date | null;
}

Inventory.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    id_product: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    quantity_in: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    quantity_out: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    current_stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    movement_type: {
      type: DataTypes.ENUM('IN', 'OUT', 'ADJUSTMENT'),
      allowNull: false,
    },
    reference_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    movement_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
    deleted_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'inventory',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
  }
);

export default Inventory;
