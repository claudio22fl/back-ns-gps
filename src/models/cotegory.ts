import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';

interface CategoryAttributes {
  id: number;
  name: string;
  created_at?: Date;
  updated_at?: Date | null;
  deleted_at?: Date | null;
}

interface CategoryCreationAttributes
  extends Optional<CategoryAttributes, 'id' | 'created_at' | 'updated_at' | 'deleted_at'> {}

export class Category
  extends Model<CategoryAttributes, CategoryCreationAttributes>
  implements CategoryAttributes
{
  public id!: number;
  public name!: string;
  public created_at?: Date;
  public updated_at?: Date | null;
  public deleted_at?: Date | null;
}

Category.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    sequelize,
    tableName: 'category',
    timestamps: false,
  }
);

export default Category;
