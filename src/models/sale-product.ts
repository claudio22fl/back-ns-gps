import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';

interface SaleProductAttributes {
  id: number;
  id_invoice: number;
  id_product: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

type SaleProductCreationAttributes = Optional<
  SaleProductAttributes,
  'id' | 'created_at' | 'updated_at' | 'deleted_at'
>;

export class SaleProduct
  extends Model<SaleProductAttributes, SaleProductCreationAttributes>
  implements SaleProductAttributes
{
  public id!: number;
  public id_invoice!: number;
  public id_product!: number;
  public quantity!: number;
  public unit_price!: number;
  public total_price!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at!: Date | null;
}

SaleProduct.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    id_invoice: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    id_product: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    total_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
    deleted_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'invoice_product',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
  }
);

export default SaleProduct;
