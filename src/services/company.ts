import { Op, literal } from "sequelize";
import { IPerson } from "../interfaces/client.interface";
import { IPagination } from "../interfaces/shared.iterface";
import { Company } from "../models";

export const getAllCompanys = async () => {
  return await Company.findAll({
    attributes: ["id", "name"],
    order: [["name", "ASC"]],
  });
};

export const getCompaniesService = async (
  page: number = 1,
  limit: number = 10,
  filterValue: string = ""
): Promise<{
  data: IPerson[];
  pagination: IPagination;
}> => {
  const offset = (page - 1) * limit;

  const { count: total, rows: data } = await Company.findAndCountAll({
    where: {
      [Op.or]: [
        { name: { [Op.like]: `%${filterValue}%` } },
        { dni: { [Op.like]: `%${filterValue}%` } },
        literal(`
          EXISTS (
            SELECT 1 FROM \`company-client\` cc
            JOIN \`client\` cl ON cl.id = cc.id_client
            WHERE cc.id_company = company.id
            AND (cl.name LIKE '%${filterValue}%' OR cl.dni LIKE '%${filterValue}%')
          )
        `),
      ],
    },
    include: [
      {
        association: "clients",
        through: { attributes: [] },
        required: false,
      },
    ],
    offset,
    limit,
  });

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
  };
};
