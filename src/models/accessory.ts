import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';

interface AccessoryAttributes {
  id: number;
  id_product: number;
  name: string;
  description: string | null;
  compatibility: string | null;
  price: number;
  stock: number;
  state: boolean;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

type AccessoryCreationAttributes = Optional<
  AccessoryAttributes,
  'id' | 'created_at' | 'updated_at' | 'deleted_at'
>;

export class Accessory
  extends Model<AccessoryAttributes, AccessoryCreationAttributes>
  implements AccessoryAttributes
{
  public id!: number;
  public id_product!: number;
  public name!: string;
  public description!: string | null;
  public compatibility!: string | null;
  public price!: number;
  public stock!: number;
  public state!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at!: Date | null;
}

Accessory.init(
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
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    compatibility: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    state: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
    deleted_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'accessory',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
  }
);

export default Accessory;
