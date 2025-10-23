// 1. MODELO DE USUARIO - src/models/user.ts
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';

interface UserAttributes {
  id: number;
  id_type_user: number;
  name: string;
  email: string;
  username: string;
  password: string;
  // state: boolean; // Campo comentado - no existe en DB actual
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

type UserCreationAttributes = Optional<
  UserAttributes,
  'id' | 'created_at' | 'updated_at' | 'deleted_at'
>;

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public id_type_user!: number;
  public name!: string;
  public email!: string;
  public username!: string;
  public password!: string;
  // public state!: boolean; // Campo comentado - no existe en DB actual
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    id_type_user: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(1000),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    username: {
      type: DataTypes.STRING(1000),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    // state: {
    //   type: DataTypes.BOOLEAN,
    //   allowNull: false,
    //   defaultValue: true,
    // }, // Campo comentado - no existe en DB actual
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
    deleted_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'user',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
  }
);

export default User;
