"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteClientService = exports.updateClientService = exports.getClientByIdService = exports.getClientsService = exports.createClientService = void 0;
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
const client_company_1 = __importDefault(require("../models/client-company"));
const createClientService = (clientData) => __awaiter(void 0, void 0, void 0, function* () {
    const newClient = yield models_1.Client.create(clientData);
    if (clientData.company_ids && Array.isArray(clientData.company_ids)) {
        yield client_company_1.default.bulkCreate(clientData.company_ids.map((id_company) => ({
            id_client: newClient.id,
            id_company,
        })));
    }
    return newClient;
});
exports.createClientService = createClientService;
const getClientsService = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (page = 1, limit = 10, filterValue = "") {
    const offset = (page - 1) * limit;
    const { count: total, rows: data } = yield models_1.Client.findAndCountAll({
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
});
exports.getClientsService = getClientsService;
const getClientByIdService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const client = yield models_1.Client.findByPk(id, {
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
    const companyIds = ((_a = client.dataValues.companies) === null || _a === void 0 ? void 0 : _a.map((c) => c.id)) || [];
    return Object.assign(Object.assign({}, client.toJSON()), { company_ids: companyIds });
});
exports.getClientByIdService = getClientByIdService;
const updateClientService = (id, clientData) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield models_1.Client.findByPk(id);
    if (!client)
        return null;
    yield client.update(clientData);
    if (clientData.company_ids && Array.isArray(clientData.company_ids)) {
        yield client_company_1.default.destroy({ where: { id_client: id } });
        yield client_company_1.default.bulkCreate(clientData.company_ids.map((id_company) => ({
            id_client: client.id,
            id_company,
        })));
    }
    return client;
});
exports.updateClientService = updateClientService;
const deleteClientService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield models_1.Client.findByPk(id);
    if (!client)
        return null;
    yield client_company_1.default.destroy({ where: { id_client: id } });
    yield client.destroy();
    return client;
});
exports.deleteClientService = deleteClientService;
