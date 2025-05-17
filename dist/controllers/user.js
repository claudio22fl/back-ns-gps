"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = void 0;
const user_1 = require("../services/user");
const customResponse_1 = require("../utils/customResponse");
const error_handle_1 = require("../utils/error.handle");
const getUsers = async (req, res) => {
    try {
        const response = await (0, user_1.getAllUsers)();
        (0, customResponse_1.customResponse)({
            res,
            statusCode: 200,
            data: response.length ? response : undefined,
            message: "Lista de usuarios",
        });
    }
    catch (error) {
        (0, error_handle_1.handleHttp)(res, "ERROR_GET_USERS", error);
    }
};
exports.getUsers = getUsers;
