import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';

interface InvoiceStateAttributes {
  id: number;
  name: string;
  description: string | null;
  state: boolean;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

type InvoiceStateCreationAttributes = Optional<
  InvoiceStateAttributes,
  'id' | 'created_at' | 'updated_at' | 'deleted_at'
>;

export class InvoiceState
  extends Model<InvoiceStateAttributes, InvoiceStateCreationAttributes>
  implements InvoiceStateAttributes
{
  public id!: number;
  public name!: string;
  public description!: string | null;
  public state!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at!: Date | null;
}

InvoiceState.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
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
    tableName: 'invoice-state',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
  }
);

export default InvoiceState;
