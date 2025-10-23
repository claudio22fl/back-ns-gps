import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';

interface TypePaymentAttributes {
  id: number;
  name: string;
  state: boolean;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

type TypePaymentCreationAttributes = Optional<
  TypePaymentAttributes,
  'id' | 'created_at' | 'updated_at' | 'deleted_at'
>;

export class TypePayment
  extends Model<TypePaymentAttributes, TypePaymentCreationAttributes>
  implements TypePaymentAttributes
{
  public id!: number;
  public name!: string;
  public state!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at!: Date | null;
}

TypePayment.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
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
    tableName: 'type_payment',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
  }
);

export default TypePayment;
