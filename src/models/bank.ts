import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';

interface BankAttributes {
  id: number;
  name: string;
  code: string | null;
  account_type: 'SAVINGS' | 'CHECKING' | 'BUSINESS';
  account_number: string;
  account_holder: string;
  state: boolean;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

type BankCreationAttributes = Optional<
  BankAttributes,
  'id' | 'created_at' | 'updated_at' | 'deleted_at'
>;

export class Bank extends Model<BankAttributes, BankCreationAttributes> implements BankAttributes {
  public id!: number;
  public name!: string;
  public code!: string | null;
  public account_type!: 'SAVINGS' | 'CHECKING' | 'BUSINESS';
  public account_number!: string;
  public account_holder!: string;
  public state!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at!: Date | null;
}

Bank.init(
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
    code: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    account_type: {
      type: DataTypes.ENUM('SAVINGS', 'CHECKING', 'BUSINESS'),
      allowNull: false,
    },
    account_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    account_holder: {
      type: DataTypes.STRING(200),
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
    tableName: 'bank',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
  }
);

export default Bank;
