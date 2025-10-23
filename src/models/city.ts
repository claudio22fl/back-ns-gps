import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';

interface CityAttributes {
  id: number;
  id_department: number;
  name: string;
  code: string | null;
  state: boolean;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

type CityCreationAttributes = Optional<
  CityAttributes,
  'id' | 'created_at' | 'updated_at' | 'deleted_at'
>;

export class City extends Model<CityAttributes, CityCreationAttributes> implements CityAttributes {
  public id!: number;
  public id_department!: number;
  public name!: string;
  public code!: string | null;
  public state!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at!: Date | null;
}

City.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    id_department: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(10),
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
    tableName: 'city',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
  }
);

export default City;
