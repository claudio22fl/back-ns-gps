import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';

interface DeviceAssignedAttributes {
  id: number;
  id_device: number;
  id_client: number;
  id_sale: number | null;
  assignment_date: Date;
  unassignment_date: Date | null;
  status: 'ASSIGNED' | 'UNASSIGNED' | 'RETURNED';
  notes: string | null;
  state: boolean;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

type DeviceAssignedCreationAttributes = Optional<
  DeviceAssignedAttributes,
  'id' | 'created_at' | 'updated_at' | 'deleted_at'
>;

export class DeviceAssigned
  extends Model<DeviceAssignedAttributes, DeviceAssignedCreationAttributes>
  implements DeviceAssignedAttributes
{
  public id!: number;
  public id_device!: number;
  public id_client!: number;
  public id_sale!: number | null;
  public assignment_date!: Date;
  public unassignment_date!: Date | null;
  public status!: 'ASSIGNED' | 'UNASSIGNED' | 'RETURNED';
  public notes!: string | null;
  public state!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at!: Date | null;
}

DeviceAssigned.init(
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
    id_client: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    id_sale: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    assignment_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    unassignment_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('ASSIGNED', 'UNASSIGNED', 'RETURNED'),
      allowNull: false,
      defaultValue: 'ASSIGNED',
    },
    notes: {
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
    tableName: 'device_assigned',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
  }
);

export default DeviceAssigned;
