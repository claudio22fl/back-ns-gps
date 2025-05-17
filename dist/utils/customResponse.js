"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customResponse = void 0;
const customResponse = ({ res, statusCode = 200, data = null, message = "Success", pagination = null, }) => {
    res.status(statusCode).json({
        status: statusCode,
        data,
        date: new Date().toISOString(),
        message,
        pagination,
    });
};
exports.customResponse = customResponse;
