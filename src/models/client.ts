import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";
import { IPerson } from "../interfaces/client.interface";

export class Client
  extends Model<IPerson, Optional<IPerson, "id">>
  implements IPerson
{
  public id!: number;
  public id_user!: number | null;
  public dni!: string | null;
  public name!: string | null;
  public phone!: string | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at!: Date | null;
}

Client.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    id_user: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    dni: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "client",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    paranoid: true,
    deletedAt: "deleted_at",
  }
);

export default Client;
