import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';

interface InvoiceAttributes {
  id: number;
  id_sale: number;
  invoice_number: string;
  issue_date: Date;
  due_date: Date | null;
  tax_amount: number;
  total_amount: number;
  state: boolean;
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
  public id_sale!: number;
  public invoice_number!: string;
  public issue_date!: Date;
  public due_date!: Date | null;
  public tax_amount!: number;
  public total_amount!: number;
  public state!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at!: Date | null;
}

Invoice.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    id_sale: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      unique: true,
    },
    invoice_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    issue_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    due_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    tax_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
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
    tableName: 'invoice',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
  }
);

export default Invoice;
