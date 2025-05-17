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
exports.getAllCompany = exports.getCompany = void 0;
const company_1 = require("../services/company");
const customResponse_1 = require("../utils/customResponse");
const error_handle_1 = require("../utils/error.handle");
const getCompany = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield (0, company_1.getAllCompanys)();
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
});
exports.getCompany = getCompany;
const getAllCompany = (_a, res_1) => __awaiter(void 0, [_a, res_1], void 0, function* ({ body }, res) {
    try {
        const { page = 1, limit = 10, filerValue } = body;
        const { data, pagination } = yield (0, company_1.getCompaniesService)(page, limit, filerValue);
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
});
exports.getAllCompany = getAllCompany;
