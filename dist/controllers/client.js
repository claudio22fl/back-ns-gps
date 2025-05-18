"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteClient = exports.updateClient = exports.createClient = exports.getClientById = exports.getClients = void 0;
const client_1 = require("../services/client");
const customResponse_1 = require("../utils/customResponse");
const error_handle_1 = require("../utils/error.handle");
const getClients = async ({ body }, res) => {
    try {
        const { page = 1, limit = 10, filerValue } = body;
        const { data, pagination } = await (0, client_1.getClientsService)(page, limit, filerValue);
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
};
exports.getClients = getClients;
const getClientById = async (req, res) => {
    try {
        const client = await (0, client_1.getClientByIdService)(req.params.id);
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
};
exports.getClientById = getClientById;
const createClient = async ({ body }, res) => {
    try {
        console.log("body", body);
        const newClient = await (0, client_1.createClientService)(body);
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
};
exports.createClient = createClient;
const updateClient = async (req, res) => {
    try {
        const updatedClient = await (0, client_1.updateClientService)(req.params.id, req.body);
        if (!updatedClient) {
            (0, customResponse_1.customResponse)({
                res,
                statusCode: 404,
                message: "Update failed, client not found",
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
};
exports.updateClient = updateClient;
const deleteClient = async (req, res) => {
    try {
        const deleted = await (0, client_1.deleteClientService)(req.params.id);
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
};
exports.deleteClient = deleteClient;
