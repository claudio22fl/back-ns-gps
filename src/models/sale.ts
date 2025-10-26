import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';

interface SaleAttributes {
  id: number;
  id_client: number;
  id_company: number | null;
  id_user: number;
  total_amount: number;
  discount: number;
  final_amount: number;
  sale_date: Date;
  description: string | null;
  state: boolean;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

type SaleCreationAttributes = Optional<
  SaleAttributes,
  'id' | 'created_at' | 'updated_at' | 'deleted_at'
>;

export class Sale extends Model<SaleAttributes, SaleCreationAttributes> implements SaleAttributes {
  public id!: number;
  public id_client!: number;
  public id_company!: number | null;
  public id_user!: number;
  public total_amount!: number;
  public discount!: number;
  public final_amount!: number;
  public sale_date!: Date;
  public description!: string | null;
  public state!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at!: Date | null;
}

Sale.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    id_client: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    id_company: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    id_user: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    discount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    final_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    sale_date: {
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
    tableName: 'invoice',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
  }
);

export default Sale;
