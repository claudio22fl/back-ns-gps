"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const db_1 = require("./config/db");
const routes_1 = require("./routes");
const app = (0, express_1.default)();
const { PORT } = process.env;
// Middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Rutas
app.use("/", routes_1.router);
app.get("/", (req, res) => {
    res.send("API funcionando correctamente");
});
// DB Connection
db_1.sequelize
    .authenticate()
    .then(() => {
    console.log("✅ Conexión a DB establecida.");
    return db_1.sequelize.sync(); // opcional: { force: true } para reset
})
    .then(() => {
    console.log("✅ Modelos sincronizados.");
    // Iniciar servidor una vez conectada la DB
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
    });
})
    .catch((err) => {
    console.error("❌ Error al conectar a la base de datos:", err);
});
