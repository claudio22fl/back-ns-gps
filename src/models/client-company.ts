import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";

interface ClientCompanyAttributes {
  id: number;
  id_company: number;
  id_client: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

type ClientCompanyCreationAttributes = Optional<
  ClientCompanyAttributes,
  "id" | "created_at" | "updated_at" | "deleted_at"
>;

class ClientCompany
  extends Model<ClientCompanyAttributes, ClientCompanyCreationAttributes>
  implements ClientCompanyAttributes
{
  public id!: number;
  public id_company!: number;
  public id_client!: number;
  public created_at!: Date;
  public updated_at!: Date;
  public deleted_at!: Date | null;
}

ClientCompany.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    id_company: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    id_client: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "company-client",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    paranoid: true,
    deletedAt: "deleted_at",
  }
);

export default ClientCompany;
