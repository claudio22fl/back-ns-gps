"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyClient = exports.Company = exports.Client = void 0;
const client_1 = __importDefault(require("./client"));
exports.Client = client_1.default;
const client_company_1 = __importDefault(require("./client-company"));
exports.CompanyClient = client_company_1.default;
const company_1 = __importDefault(require("./company"));
exports.Company = company_1.default;
client_1.default.belongsToMany(company_1.default, {
    through: client_company_1.default,
    foreignKey: "id_client",
    otherKey: "id_company",
    as: "companies",
});
company_1.default.belongsToMany(client_1.default, {
    through: client_company_1.default,
    foreignKey: "id_company",
    otherKey: "id_client",
    as: "clients",
});
