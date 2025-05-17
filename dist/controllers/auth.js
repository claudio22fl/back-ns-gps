"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerController = exports.loginController = void 0;
const auth_1 = require("../services/auth");
const customResponse_1 = require("../utils/customResponse");
const error_handle_1 = require("../utils/error.handle");
const loginController = async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await (0, auth_1.loginUser)(email, password);
        (0, customResponse_1.customResponse)({
            res,
            data: result,
            message: "Inicio de sesión exitoso",
        });
    }
    catch (err) {
        (0, error_handle_1.handleHttp)(res, "ERROR_LOGIN", err);
    }
};
exports.loginController = loginController;
const registerController = async (req, res) => {
    try {
        const newUser = await (0, auth_1.createUser)(req.body);
        (0, customResponse_1.customResponse)({
            res,
            data: newUser,
            message: "Usuario creado exitosamente",
        });
    }
    catch (err) {
        (0, error_handle_1.handleHttp)(res, "ERROR_CREATE_USER", err);
    }
};
exports.registerController = registerController;
