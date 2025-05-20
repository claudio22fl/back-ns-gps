import { QueryTypes } from 'sequelize';
import { sequelize } from '../config/db';
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

  const replacements = {
    filter: `%${filterValue}%`,
    offset,
    limit,
  };

  // 1. Traer los datos paginados
  const data: IPerson[] = await sequelize.query(
    `
    SELECT DISTINCT c.* FROM client c
    LEFT JOIN \`client-company\` cc ON c.id = cc.id_client
    LEFT JOIN \`company\` co ON co.id = cc.id_company
    WHERE c.name LIKE :filter
      OR c.dni LIKE :filter
      OR co.name LIKE :filter
      OR co.dni LIKE :filter
    LIMIT :offset, :limit
  `,
    {
      replacements,
      type: QueryTypes.SELECT,
    }
  );

  // 2. Traer el total para paginación
  const totalResult: { count: number }[] = await sequelize.query(
    `
    SELECT COUNT(DISTINCT c.id) AS count FROM client c
    LEFT JOIN \`client-company\` cc ON c.id = cc.id_client
    LEFT JOIN \`company\` co ON co.id = cc.id_company
    WHERE c.name LIKE :filter
      OR c.dni LIKE :filter
      OR co.name LIKE :filter
      OR co.dni LIKE :filter
  `,
    {
      replacements: { filter: `%${filterValue}%` },
      type: QueryTypes.SELECT,
    }
  );

  const total = totalResult[0].count;

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
