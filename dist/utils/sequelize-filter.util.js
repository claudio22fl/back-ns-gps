"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateWhereClause = void 0;
// utils/sequelize-filter.util.ts
const sequelize_1 = require("sequelize");
const generateWhereClause = (model, filterValue) => {
    if (!filterValue)
        return {};
    const searchableFields = Object.entries(model.rawAttributes)
        .filter(([_, value]) => value.type instanceof sequelize_1.DataTypes.STRING ||
        value.type instanceof sequelize_1.DataTypes.TEXT ||
        value.type instanceof sequelize_1.DataTypes.INTEGER ||
        value.type instanceof sequelize_1.DataTypes.FLOAT)
        .map(([key]) => ({
        [key]: { [sequelize_1.Op.like]: `%${filterValue.toLowerCase().trim()}%` },
    }));
    return { [sequelize_1.Op.or]: searchableFields };
};
exports.generateWhereClause = generateWhereClause;
