import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import { sequelize } from './config/db';
import { router as productRouter } from './routes';

const app = express();
const { PORT, ROUTE } = process.env;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use(`/${ROUTE}`, productRouter);

app.get(`/${ROUTE}`, (_, res) => {
  res.send('API funcionando correctamente');
});

// DB Connection
sequelize
  .authenticate()
  .then(() => {
    console.log('✅ Conexión a DB establecida.');
    return sequelize.sync(); // opcional: { force: true } para reset
  })
  .then(() => {
    console.log('✅ Modelos sincronizados.');
    // Iniciar servidor una vez conectada la DB
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Error al conectar a la base de datos:', err);
  });
