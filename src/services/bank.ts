import { IPagination } from '../interfaces/shared.iterface';
import Bank from '../models/bank';
import { generateWhereClause } from '../utils/sequelize-filter.util';

// Obtener todos los bancos con paginación y filtro
export const getAllBanks = async (
  page: number = 1,
  limit: number = 10,
  filterValue: string = ''
): Promise<{
  data: Bank[];
  pagination: IPagination;
}> => {
  const offset = (page - 1) * limit;
  const whereClause = generateWhereClause(Bank, filterValue);

  const { count: total, rows: data } = await Bank.findAndCountAll({
    where: whereClause,
    offset,
    limit,
    order: [['name', 'ASC']],
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

// Obtener todos los bancos sin paginación (para dropdowns)
export const getAllBanksSimple = async (): Promise<Bank[]> => {
  return await Bank.findAll({
    attributes: ['id', 'name'],
    order: [['name', 'ASC']],
  });
};

// Obtener banco por ID
export const getBankById = async (id: number): Promise<Bank | null> => {
  return await Bank.findByPk(id);
};

// Crear nuevo banco
export const createBankService = async (bankData: { name: string }): Promise<Bank> => {
  return await Bank.create(bankData);
};

// Actualizar banco
export const updateBankService = async (
  id: number,
  bankData: { name: string }
): Promise<Bank | null> => {
  const bank = await Bank.findByPk(id);
  if (!bank) return null;

  await bank.update(bankData);
  return bank;
};

// Eliminar banco (soft delete)
export const deleteBankService = async (id: number): Promise<boolean> => {
  const bank = await Bank.findByPk(id);
  if (!bank) return false;

  await bank.destroy();
  return true;
};
