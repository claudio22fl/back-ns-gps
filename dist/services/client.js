"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteClientService = exports.updateClientService = exports.getClientByIdService = exports.getClientsService = exports.createClientService = void 0;
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
const client_company_1 = __importDefault(require("../models/client-company"));
const createClientService = async (clientData) => {
    const newClient = await models_1.Client.create(clientData);
    if (clientData.company_ids && Array.isArray(clientData.company_ids)) {
        await client_company_1.default.bulkCreate(clientData.company_ids.map((id_company) => ({
            id_client: newClient.id,
            id_company,
        })));
    }
    return newClient;
};
exports.createClientService = createClientService;
const getClientsService = async (page = 1, limit = 10, filterValue = "") => {
    const offset = (page - 1) * limit;
    const { count: total, rows: data } = await models_1.Client.findAndCountAll({
        where: {
            [sequelize_1.Op.or]: [
                { name: { [sequelize_1.Op.like]: `%${filterValue}%` } },
                { dni: { [sequelize_1.Op.like]: `%${filterValue}%` } },
                (0, sequelize_1.literal)(`
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
                association: "companies",
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
exports.getClientsService = getClientsService;
const getClientByIdService = async (id) => {
    const client = await models_1.Client.findByPk(id, {
        include: [
            {
                association: "companies",
                attributes: ["id"],
                through: { attributes: [] },
            },
        ],
    });
    if (!client)
        return null;
    const companyIds = client.dataValues.companies?.map((c) => c.id) || [];
    return {
        ...client.toJSON(),
        company_ids: companyIds,
    };
};
exports.getClientByIdService = getClientByIdService;
const updateClientService = async (id, clientData) => {
    const client = await models_1.Client.findByPk(id);
    if (!client)
        return null;
    await client.update(clientData);
    if (clientData.company_ids && Array.isArray(clientData.company_ids)) {
        await client_company_1.default.destroy({ where: { id_client: id } });
        await client_company_1.default.bulkCreate(clientData.company_ids.map((id_company) => ({
            id_client: client.id,
            id_company,
        })));
    }
    return client;
};
exports.updateClientService = updateClientService;
const deleteClientService = async (id) => {
    const client = await models_1.Client.findByPk(id);
    if (!client)
        return null;
    await client_company_1.default.destroy({ where: { id_client: id } });
    await client.destroy();
    return client;
};
exports.deleteClientService = deleteClientService;
