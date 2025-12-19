import { Router } from 'express';
import { migrationController } from '../controllers/migration';

const router = Router();

/**
 * POST /api/v1/migration/sales
 * Migra ventas del sistema antiguo
 * Body: { data: OldSaleData[] }
 */
router.post('/sales', migrationController.migrateSales.bind(migrationController));

/**
 * GET /api/v1/migration/stats
 * Obtiene estadísticas de la base de datos
 */
router.get('/stats', migrationController.getStats.bind(migrationController));

export { router };
