import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';

interface DeviceAttributes {
  id: number;
  serial_number: string;
  imei: string | null;
  model: string | null;
  brand: string | null;
  firmware_version: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'DAMAGED';
  purchase_date: Date | null;
  warranty_expiry: Date | null;
  state: boolean;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

type DeviceCreationAttributes = Optional<
  DeviceAttributes,
  'id' | 'created_at' | 'updated_at' | 'deleted_at'
>;

export class Device
  extends Model<DeviceAttributes, DeviceCreationAttributes>
  implements DeviceAttributes
{
  public id!: number;
  public serial_number!: string;
  public imei!: string | null;
  public model!: string | null;
  public brand!: string | null;
  public firmware_version!: string | null;
  public status!: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'DAMAGED';
  public purchase_date!: Date | null;
  public warranty_expiry!: Date | null;
  public state!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at!: Date | null;
}

Device.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    serial_number: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    imei: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true,
    },
    model: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    brand: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    firmware_version: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'MAINTENANCE', 'DAMAGED'),
      allowNull: false,
      defaultValue: 'INACTIVE',
    },
    purchase_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    warranty_expiry: {
      type: DataTypes.DATE,
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
    tableName: 'device',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
  }
);

export default Device;
