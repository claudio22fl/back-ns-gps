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
exports.deleteClient = exports.updateClient = exports.createClient = exports.getClientById = exports.getClients = void 0;
const client_1 = require("../services/client");
const customResponse_1 = require("../utils/customResponse");
const error_handle_1 = require("../utils/error.handle");
const getClients = (_a, res_1) => __awaiter(void 0, [_a, res_1], void 0, function* ({ body }, res) {
    try {
        const { page = 1, limit = 10, filerValue } = body;
        const { data, pagination } = yield (0, client_1.getClientsService)(page, limit, filerValue);
        (0, customResponse_1.customResponse)({
            res,
            statusCode: 200,
            data: data.length ? data : undefined,
            message: "Lista de clientes",
            pagination: pagination,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching clients", error });
    }
});
exports.getClients = getClients;
const getClientById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const client = yield (0, client_1.getClientByIdService)(req.params.id);
        if (!client) {
            (0, customResponse_1.customResponse)({
                res,
                statusCode: 404,
                message: "Client not found",
                data: null,
            });
            return;
        }
        (0, customResponse_1.customResponse)({
            res,
            statusCode: 200,
            message: "Client found",
            data: client,
        });
    }
    catch (error) {
        (0, error_handle_1.handleHttp)(res, "ERROR_GET_CLIENT", error);
    }
});
exports.getClientById = getClientById;
const createClient = (_a, res_1) => __awaiter(void 0, [_a, res_1], void 0, function* ({ body }, res) {
    try {
        console.log("body", body);
        const newClient = yield (0, client_1.createClientService)(body);
        (0, customResponse_1.customResponse)({
            res,
            statusCode: 201,
            message: "Client created successfully",
            data: newClient,
        });
    }
    catch (error) {
        (0, error_handle_1.handleHttp)(res, "ERROR_CREATE_CLIENT", error);
    }
});
exports.createClient = createClient;
const updateClient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedClient = yield (0, client_1.updateClientService)(req.params.id, req.body);
        if (!updatedClient) {
            (0, customResponse_1.customResponse)({
                res,
                statusCode: 404,
                message: "Client not found",
                data: null,
            });
            return;
        }
        (0, customResponse_1.customResponse)({
            res,
            statusCode: 200,
            message: "Client updated successfully",
            data: true,
        });
    }
    catch (error) {
        (0, error_handle_1.handleHttp)(res, "ERROR_UPDATE_CLIENT", error);
    }
});
exports.updateClient = updateClient;
const deleteClient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deleted = yield (0, client_1.deleteClientService)(req.params.id);
        if (!deleted) {
            (0, customResponse_1.customResponse)({
                res,
                statusCode: 404,
                message: "Client not found",
                data: null,
            });
            return;
        }
        (0, customResponse_1.customResponse)({
            res,
            statusCode: 200,
            message: "Client deleted successfully",
            data: null,
        });
    }
    catch (error) {
        (0, error_handle_1.handleHttp)(res, "ERROR_DELETE_CLIENT", error);
    }
});
exports.deleteClient = deleteClient;
