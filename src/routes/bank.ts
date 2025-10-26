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

router.get('/', getBanks);
router.get('/simple', getBanksSimple);
router.get('/:id', getBank);
router.post('/', createBank);
router.put('/:id', updateBank);
router.delete('/:id', deleteBank);

export { router };
