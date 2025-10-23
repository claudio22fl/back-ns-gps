import { Router } from 'express';
import {
  createBank,
  deleteBank,
  getBank,
  getBanks,
  getBanksSimple,
  updateBank,
} from '../controllers/bank';

const router = Router();

// GET /bank - Obtener todos los bancos con paginación
router.get('/', getBanks);

// GET /bank/simple - Obtener lista simple de bancos (para dropdowns)
router.get('/simple', getBanksSimple);

// GET /bank/:id - Obtener banco por ID
router.get('/:id', getBank);

// POST /bank - Crear nuevo banco
router.post('/', createBank);

// PUT /bank/:id - Actualizar banco
router.put('/:id', updateBank);

// DELETE /bank/:id - Eliminar banco
router.delete('/:id', deleteBank);

export { router };
