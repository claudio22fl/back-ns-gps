import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';

interface LocationAttributes {
  id: number;
  id_device: number;
  latitude: number;
  longitude: number;
  altitude: number | null;
  speed: number | null;
  heading: number | null;
  accuracy: number | null;
  timestamp: Date;
  address: string | null;
  state: boolean;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

type LocationCreationAttributes = Optional<
  LocationAttributes,
  'id' | 'created_at' | 'updated_at' | 'deleted_at'
>;

export class Location
  extends Model<LocationAttributes, LocationCreationAttributes>
  implements LocationAttributes
{
  public id!: number;
  public id_device!: number;
  public latitude!: number;
  public longitude!: number;
  public altitude!: number | null;
  public speed!: number | null;
  public heading!: number | null;
  public accuracy!: number | null;
  public timestamp!: Date;
  public address!: string | null;
  public state!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at!: Date | null;
}

Location.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    id_device: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: false,
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false,
    },
    altitude: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
    },
    speed: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
    },
    heading: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    accuracy: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING(500),
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
    tableName: 'location',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
  }
);

export default Location;
