// utils/sequelize-filter.util.ts
import { DataTypes, ModelStatic, Op, WhereOptions } from "sequelize";

export const generateWhereClause = (
  model: ModelStatic<any>,
  filterValue: string
): WhereOptions => {
  if (!filterValue) return {};

  const searchableFields = Object.entries(model.rawAttributes)
    .filter(
      ([_, value]) =>
        value.type instanceof DataTypes.STRING ||
        value.type instanceof DataTypes.TEXT ||
        value.type instanceof DataTypes.INTEGER ||
        value.type instanceof DataTypes.FLOAT
    )
    .map(([key]) => ({
      [key]: { [Op.like]: `%${filterValue.toLowerCase().trim()}%` },
    }));

  return { [Op.or]: searchableFields };
};
