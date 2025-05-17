"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = exports.loginUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = require("../models/user");
const loginUser = async (username, password) => {
    const user = await user_1.User.findOne({ where: { username } });
    if (!user)
        throw new Error("Usuario no encontrado");
    const isMatch = await bcryptjs_1.default.compare(password, user?.password);
    if (!isMatch)
        throw new Error("Contraseña incorrecta");
    const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "1d" });
    return { token, ...user };
};
exports.loginUser = loginUser;
const createUser = async (userData) => {
    const hashedPassword = await bcryptjs_1.default.hash(userData.password, 10);
    const newUser = await user_1.User.create({ ...userData, password: hashedPassword });
    return newUser;
};
exports.createUser = createUser;
