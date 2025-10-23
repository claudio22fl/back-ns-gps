// import { Op } from 'sequelize'; // No usado por ahora
import { IPagination } from '../interfaces/shared.iterface';
import Company from '../models/company';
import { generateWhereClause } from '../utils/sequelize-filter.util';

export const getAllCompanys = async () => {
  return await Company.findAll({
    attributes: ['id', 'name'],
    order: [['name', 'ASC']],
  });
};

export const getCompaniesService = async (
  page: number = 1,
  limit: number = 10,
  filterValue: string = ''
): Promise<{
  data: Company[];
  pagination: IPagination;
}> => {
  const offset = (page - 1) * limit;

  // Usar generateWhereClause para filtrado universal
  const whereClause = generateWhereClause(Company, filterValue);

  const { count: total, rows: data } = await Company.findAndCountAll({
    where: whereClause,
    include: [
      {
        association: 'clients',
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
