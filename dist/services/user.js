"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = void 0;
const user_1 = require("../models/user");
const getAllUsers = async () => {
    return await user_1.User.findAll({
        attributes: ["id", "name"],
    });
};
exports.getAllUsers = getAllUsers;
