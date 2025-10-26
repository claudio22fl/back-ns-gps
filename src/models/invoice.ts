import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';

interface InvoiceAttributes {
  id: number;
  date: Date | null;
  total: number | null;
  'id_invoice-state': number | null;
  is_return: boolean | null;
  id_client: number | null;
  id_company: number | null;
  id_user: number | null;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

type InvoiceCreationAttributes = Optional<
  InvoiceAttributes,
  'id' | 'created_at' | 'updated_at' | 'deleted_at'
>;

export class Invoice
  extends Model<InvoiceAttributes, InvoiceCreationAttributes>
  implements InvoiceAttributes
{
  public id!: number;
  public date!: Date | null;
  public total!: number | null;
  public 'id_invoice-state'!: number | null;
  public is_return!: boolean | null;
  public id_client!: number | null;
  public id_company!: number | null;
  public id_user!: number | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at!: Date | null;
}

Invoice.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    total: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    'id_invoice-state': {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    is_return: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    id_client: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_company: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_user: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
    deleted_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'invoice',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
  }
);

export default Invoice;
