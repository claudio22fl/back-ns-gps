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

interface IClientWithCompanies extends IPerson {
  companies: IPerson[];
}

export const getClientsService = async (
  page: number = 1,
  limit: number = 10,
  filterValue: string = ''
): Promise<{
  data: IClientWithCompanies[];
  pagination: IPagination;
}> => {
  const offset = (page - 1) * limit;
  const filter = `%${filterValue}%`;

  // 1. Obtener clientes con empresas agrupadas como JSON
  const rawClients = await sequelize.query(
    `
    SELECT 
      c.id,
      c.id_user,
      c.dni,
      c.name,
      c.phone,
      c.created_at,
      c.updated_at,
      c.deleted_at,
      GROUP_CONCAT(
  DISTINCT IF(
    co.id IS NOT NULL,
    JSON_OBJECT(
      'id', co.id,
      'id_user', co.id_user,
      'dni', co.dni,
      'name', co.name,
      'phone', co.phone,
      'created_at', co.created_at,
      'updated_at', co.updated_at,
      'deleted_at', co.deleted_at
    ),
    NULL
  )
) AS companies_json
    FROM client c
    LEFT JOIN \`company-client\` cc ON c.id = cc.id_client
    LEFT JOIN company co ON co.id = cc.id_company
    WHERE 
      c.name LIKE :filter OR 
      c.dni LIKE :filter OR
      co.name LIKE :filter OR
      co.dni LIKE :filter
    GROUP BY c.id
    ORDER BY c.id ASC
    LIMIT :offset, :limit
  `,
    {
      replacements: { filter, offset, limit },
      type: QueryTypes.SELECT,
    }
  );

  // 2. Total de clientes distintos (sin límite)
  const totalResult = (await sequelize.query(
    `
    SELECT COUNT(DISTINCT c.id) AS count
    FROM client c
    LEFT JOIN \`company-client\` cc ON c.id = cc.id_client
    LEFT JOIN company co ON co.id = cc.id_company
    WHERE 
      c.name LIKE :filter OR 
      c.dni LIKE :filter OR
      co.name LIKE :filter OR
      co.dni LIKE :filter
  `,
    {
      replacements: { filter },
      type: QueryTypes.SELECT,
    }
  )) as { count: number }[];

  const total = totalResult[0]?.count || 0;

  // 3. Procesar y parsear las empresas desde el JSON concatenado
  const data: IClientWithCompanies[] = (rawClients as any[]).map((row) => {
    const companiesRaw = row.companies_json;

    return {
      ...row,
      companies:
        companiesRaw && companiesRaw.trim() !== ''
          ? JSON.parse(`[${companiesRaw.replace(/}{/g, '},{')}]`)
          : null,
    };
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

  const clientJson = client.toJSON() as any;
  const companyIds = clientJson.companies?.map((c: any) => c.id) || [];

  return {
    ...clientJson,
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
