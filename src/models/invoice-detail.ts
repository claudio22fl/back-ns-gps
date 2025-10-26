import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';

interface InvoiceDetailAttributes {
  id: number;
  id_invoice: number | null;
  is_fp: boolean | null;
  id_product: number | null;
  quantity: number | null;
  reason: string | null;
  price_cost: number | null;
  price_sale: number | null;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

type InvoiceDetailCreationAttributes = Optional<
  InvoiceDetailAttributes,
  'id' | 'created_at' | 'updated_at' | 'deleted_at'
>;

export class InvoiceDetail
  extends Model<InvoiceDetailAttributes, InvoiceDetailCreationAttributes>
  implements InvoiceDetailAttributes
{
  public id!: number;
  public id_invoice!: number | null;
  public is_fp!: boolean | null;
  public id_product!: number | null;
  public quantity!: number | null;
  public reason!: string | null;
  public price_cost!: number | null;
  public price_sale!: number | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at!: Date | null;
}

InvoiceDetail.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_invoice: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    is_fp: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    id_product: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    reason: {
      type: DataTypes.STRING(1000),
      allowNull: true,
    },
    price_cost: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    price_sale: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
    deleted_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'invoice-detail',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
  }
);

export default InvoiceDetail;
