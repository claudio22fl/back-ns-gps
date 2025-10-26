import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';

interface PaymentInvoiceAttributes {
  id: number;
  id_invoice: number | null;
  amount: number | null;
  id_bank: string | null; // Cambiado a string para permitir tanto IDs como texto
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

type PaymentInvoiceCreationAttributes = Optional<
  PaymentInvoiceAttributes,
  'id' | 'created_at' | 'updated_at' | 'deleted_at'
>;

export class PaymentInvoice
  extends Model<PaymentInvoiceAttributes, PaymentInvoiceCreationAttributes>
  implements PaymentInvoiceAttributes
{
  public id!: number;
  public id_invoice!: number | null;
  public amount!: number | null;
  public id_bank!: string | null; // Cambiado a string para permitir tanto IDs como texto
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at!: Date | null;
}

PaymentInvoice.init(
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
    amount: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_bank: {
      type: DataTypes.STRING, // Cambiado a STRING para permitir tanto IDs como texto
      allowNull: true,
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
    deleted_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'payment-invoice',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
  }
);

export default PaymentInvoice;
