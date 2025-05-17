"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.sequelize = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const sequelize_1 = require("sequelize");
let pool;
exports.sequelize = new sequelize_1.Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false, // puedes habilitarlo para ver las queries
});
const db = async () => {
    if (!pool) {
        pool = promise_1.default.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
        });
    }
    try {
        const connection = await pool.getConnection();
        await connection.ping();
        connection.release();
        return pool;
    }
    catch (err) {
        console.error("Error al conectar a la base de datos:", err);
        throw err;
    }
};
exports.db = db;
