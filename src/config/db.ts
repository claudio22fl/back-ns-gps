import mysql from "mysql2/promise";
import { Sequelize } from "sequelize";

let pool: mysql.Pool;

export const sequelize = new Sequelize(
  process.env.DB_NAME as string,
  process.env.DB_USER as string,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false, // puedes habilitarlo para ver las queries
  }
);

export const db = async () => {
  if (!pool) {
    pool = mysql.createPool({
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
  } catch (err) {
    console.error("Error al conectar a la base de datos:", err);
    throw err;
  }
};
