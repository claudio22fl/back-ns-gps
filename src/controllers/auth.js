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
exports.registerController = exports.loginController = void 0;
const auth_1 = require("../services/auth");
const customResponse_1 = require("../utils/customResponse");
const error_handle_1 = require("../utils/error.handle");
const loginController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const result = yield (0, auth_1.loginUser)(email, password);
        (0, customResponse_1.customResponse)({
            res,
            data: result,
            message: "Inicio de sesión exitoso",
        });
    }
    catch (err) {
        (0, error_handle_1.handleHttp)(res, "ERROR_LOGIN", err);
    }
});
exports.loginController = loginController;
const registerController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newUser = yield (0, auth_1.createUser)(req.body);
        (0, customResponse_1.customResponse)({
            res,
            data: newUser,
            message: "Usuario creado exitosamente",
        });
    }
    catch (err) {
        (0, error_handle_1.handleHttp)(res, "ERROR_CREATE_USER", err);
    }
});
exports.registerController = registerController;
