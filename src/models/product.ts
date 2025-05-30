import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db";
import {
  ProductAttributes,
  ProductCreationAttributes,
} from "../interfaces/product.interface";

export class Product
  extends Model<ProductAttributes, ProductCreationAttributes>
  implements ProductAttributes
{
  public id!: number;
  public name!: string;
  public description!: string;
  public price!: number;
  public price_cost!: number;
  public stock!: number;
  public state!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at!: Date;
}

Product.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(1000),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(1000),
      allowNull: true,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price_cost: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    state: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
    deleted_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "product",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    paranoid: true,
    deletedAt: "deleted_at",
  }
);

export default Product;
