import mysql from "mysql2/promise";
import { Sequelize } from "sequelize";

let pool: mysql.Pool;

export const sequelize = new Sequelize(
  process.env.DB_NAME || "nsgps",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "123456",
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "mysql",
    logging: false,
  }
);

export const db = async () => {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "123456",
      database: process.env.DB_NAME || "nsgps",
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
  } catch (err) {
    console.error("Error al conectar a la base de datos:", err);
    throw err;
  }
};
