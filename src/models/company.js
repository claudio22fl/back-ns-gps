"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Company = void 0;
const sequelize_1 = require("sequelize");
const db_1 = require("../config/db");
class Company extends sequelize_1.Model {
}
exports.Company = Company;
Company.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    id_user: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    dni: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING(1000),
        allowNull: true,
    },
    phone: {
        type: sequelize_1.DataTypes.STRING(45),
        allowNull: true,
    },
    created_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    updated_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    deleted_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
}, {
    sequelize: db_1.sequelize,
    tableName: "company",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    paranoid: true,
    deletedAt: "deleted_at",
});
exports.default = Company;
