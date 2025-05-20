import { Op, literal } from 'sequelize';
import { IPerson, IPersonDTO } from '../interfaces/client.interface';
import { IPagination } from '../interfaces/shared.iterface';
import { Client } from '../models';
import ClientCompany from '../models/client-company';

export const createClientService = async (clientData: Partial<IPersonDTO>) => {
  const newClient = await Client.create(clientData as any);

  if (clientData.company_ids && Array.isArray(clientData.company_ids)) {
    await ClientCompany.bulkCreate(
      clientData.company_ids.map((id_company) => ({
        id_client: newClient.id,
        id_company,
      }))
    );
  }

  return newClient;
};

export const getClientsService = async (
  page: number = 1,
  limit: number = 10,
  filterValue: string = ''
): Promise<{
  data: IPerson[];
  pagination: IPagination;
}> => {
  const offset = (page - 1) * limit;

  const { count: total, rows: data } = await Client.findAndCountAll({
    where: {
      [Op.or]: [
        { name: { [Op.like]: `%${filterValue}%` } },
        { dni: { [Op.like]: `%${filterValue}%` } },
        literal(`
        EXISTS (
          SELECT 1 FROM \`company-client\` cc
          JOIN \`company\` c ON c.id = cc.id_company
          WHERE cc.id_client = client.id
          AND (c.name LIKE '%${filterValue}%' OR c.dni LIKE '%${filterValue}%')
        )
      `),
      ],
    },
    include: [
      {
        association: 'companies',
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

export const getClientByIdService = async (id: string) => {
  const client = await Client.findByPk(id, {
    include: [
      {
        association: 'companies',
        attributes: ['id'],
        through: { attributes: [] },
      },
    ],
  });

  if (!client) return null;

  const companyIds = client.dataValues.companies?.map((c: any) => c.id) || [];

  return {
    ...client.toJSON(),
    company_ids: companyIds,
  };
};

export const updateClientService = async (id: string, clientData: Partial<IPersonDTO>) => {
  const client = await Client.findByPk(id);
  if (!client) return null;

  await client.update(clientData);

  if (clientData.company_ids && Array.isArray(clientData.company_ids)) {
    await ClientCompany.destroy({ where: { id_client: id } });
    await ClientCompany.bulkCreate(
      clientData.company_ids.map((id_company) => ({
        id_client: client.id,
        id_company,
      }))
    );
  }

  return client;
};

export const deleteClientService = async (id: string) => {
  const client = await Client.findByPk(id);
  if (!client) return null;

  await ClientCompany.destroy({ where: { id_client: id } });
  await client.destroy();

  return client;
};
