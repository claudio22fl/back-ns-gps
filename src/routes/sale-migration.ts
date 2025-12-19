import { Router } from 'express';
import { migrateSales, validateMigrationData } from '../controllers/sale-migration';

const router = Router();

/**
 * POST /api/v1/sale-migration
 * Migra ventas desde el sistema antiguo
 *
 * Body:
 * {
 *   "ventas": [...],
 *   "overwrite": false  // opcional, por defecto false
 * }
 */
router.post('/', migrateSales);

/**
 * POST /api/v1/sale-migration/validate
 * Valida estructura de datos sin migrar
 */
router.post('/validate', validateMigrationData);

export { router };
