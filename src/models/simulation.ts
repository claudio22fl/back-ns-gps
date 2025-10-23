import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';

interface SimulationAttributes {
  id: number;
  id_client: number;
  id_device: number | null;
  simulation_name: string;
  start_location: string;
  end_location: string;
  route_data: JSON | null;
  duration_minutes: number | null;
  distance_km: number | null;
  simulation_date: Date;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  results: JSON | null;
  state: boolean;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

type SimulationCreationAttributes = Optional<
  SimulationAttributes,
  'id' | 'created_at' | 'updated_at' | 'deleted_at'
>;

export class Simulation
  extends Model<SimulationAttributes, SimulationCreationAttributes>
  implements SimulationAttributes
{
  public id!: number;
  public id_client!: number;
  public id_device!: number | null;
  public simulation_name!: string;
  public start_location!: string;
  public end_location!: string;
  public route_data!: JSON | null;
  public duration_minutes!: number | null;
  public distance_km!: number | null;
  public simulation_date!: Date;
  public status!: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  public results!: JSON | null;
  public state!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at!: Date | null;
}

Simulation.init(
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
    id_device: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    simulation_name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    start_location: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    end_location: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    route_data: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    duration_minutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    distance_km: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
    },
    simulation_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'RUNNING', 'COMPLETED', 'FAILED'),
      allowNull: false,
      defaultValue: 'PENDING',
    },
    results: {
      type: DataTypes.JSON,
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
    tableName: 'simulation',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
  }
);

export default Simulation;
