"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCompany = exports.getCompany = void 0;
const company_1 = require("../services/company");
const customResponse_1 = require("../utils/customResponse");
const error_handle_1 = require("../utils/error.handle");
const getCompany = async (req, res) => {
    try {
        const response = await (0, company_1.getAllCompanys)();
        (0, customResponse_1.customResponse)({
            res,
            statusCode: 200,
            data: response.length ? response : undefined,
            message: "Lista de compañias",
        });
    }
    catch (error) {
        (0, error_handle_1.handleHttp)(res, "ERROR_GET_COMPANY", error);
    }
};
exports.getCompany = getCompany;
const getAllCompany = async ({ body }, res) => {
    try {
        const { page = 1, limit = 10, filerValue } = body;
        const { data, pagination } = await (0, company_1.getCompaniesService)(page, limit, filerValue);
        (0, customResponse_1.customResponse)({
            res,
            statusCode: 200,
            data: data.length ? data : undefined,
            message: "company list",
            pagination: pagination,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching companys", error });
    }
};
exports.getAllCompany = getAllCompany;
