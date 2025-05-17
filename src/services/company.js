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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompaniesService = exports.getAllCompanys = void 0;
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
const getAllCompanys = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield models_1.Company.findAll({
        attributes: ["id", "name"],
        order: [["name", "ASC"]],
    });
});
exports.getAllCompanys = getAllCompanys;
const getCompaniesService = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (page = 1, limit = 10, filterValue = "") {
    const offset = (page - 1) * limit;
    const { count: total, rows: data } = yield models_1.Company.findAndCountAll({
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
});
exports.getCompaniesService = getCompaniesService;
