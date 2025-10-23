import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';

interface PaymentAttributes {
  id: number;
  id_sale: number;
  id_type_payment: number;
  amount: number;
  payment_date: Date;
  description: string | null;
  state: boolean;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

type PaymentCreationAttributes = Optional<
  PaymentAttributes,
  'id' | 'created_at' | 'updated_at' | 'deleted_at'
>;

export class Payment
  extends Model<PaymentAttributes, PaymentCreationAttributes>
  implements PaymentAttributes
{
  public id!: number;
  public id_sale!: number;
  public id_type_payment!: number;
  public amount!: number;
  public payment_date!: Date;
  public description!: string | null;
  public state!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at!: Date | null;
}

Payment.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    id_sale: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    id_type_payment: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    payment_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    tableName: 'payment',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
  }
);

export default Payment;
