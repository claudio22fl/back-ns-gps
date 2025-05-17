"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompaniesService = exports.getAllCompanys = void 0;
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
const getAllCompanys = async () => {
    return await models_1.Company.findAll({
        attributes: ["id", "name"],
        order: [["name", "ASC"]],
    });
};
exports.getAllCompanys = getAllCompanys;
const getCompaniesService = async (page = 1, limit = 10, filterValue = "") => {
    const offset = (page - 1) * limit;
    const { count: total, rows: data } = await models_1.Company.findAndCountAll({
        where: {
            [sequelize_1.Op.or]: [
                { name: { [sequelize_1.Op.like]: `%${filterValue}%` } },
                { dni: { [sequelize_1.Op.like]: `%${filterValue}%` } },
                (0, sequelize_1.literal)(`
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
exports.getCompaniesService = getCompaniesService;
