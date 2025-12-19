import { Router } from 'express';
import InvoiceController from '../controllers/invoice';

const router = Router();

/**
 * @route POST /invoice
 * @desc Crear un nuevo invoice con todos los datos relacionados
 * @body CreateInvoicePayload
 */
router.post('/', InvoiceController.createInvoice);

/**
 * @route GET /invoice/:id
 * @desc Obtener un invoice por ID con todos los detalles
 * @param id - ID del invoice
 */
router.get('/:id', InvoiceController.getInvoiceById);

/**
 * @route GET /invoice/pdf/:id
 * @desc Generar PDF de factura y devolver en base64
 * @param id - ID del invoice
 */
router.get('/pdf/:id', InvoiceController.generateInvoicePDF);

/**
 * @route GET /invoice
 * @desc Obtener todos los invoices con paginación
 * @query page - Número de página (default: 1)
 * @query limit - Cantidad de registros por página (default: 10)
 */
router.get('/', InvoiceController.getAllInvoices);

// ==================== RUTAS DASHBOARD ====================

/**
 * @route GET /invoice/dashboard/all-metrics
 * @desc Obtiene todas las métricas del dashboard en una sola llamada (optimizado)
 */
router.get('/dashboard/all-metrics', InvoiceController.getAllDashboardMetrics);

/**
 * @route GET /invoice/dashboard/daily-metrics
 * @desc Obtiene métricas del día actual (bruto, neto, comparación con ayer, pagos)
 */
router.get('/dashboard/daily-metrics', InvoiceController.getDailyMetrics);

/**
 * @route GET /invoice/dashboard/monthly-metrics
 * @desc Obtiene métricas del mes actual (bruto, neto, IVA, comparación con mes anterior)
 */
router.get('/dashboard/monthly-metrics', InvoiceController.getMonthlyMetrics);

/**
 * @route GET /invoice/dashboard/daily-sales
 * @desc Obtiene ventas diarias del mes actual (bruto y neto) para gráfico
 */
router.get('/dashboard/daily-sales', InvoiceController.getDailySalesOfMonth);

/**
 * @route GET /invoice/dashboard/daily-sales-by-payment
 * @desc Obtiene ventas diarias del mes con desglose por método de pago
 */
router.get('/dashboard/daily-sales-by-payment', InvoiceController.getDailySalesByPaymentMethod);

/**
 * @route GET /invoice/dashboard/monthly-sales-comparison
 * @desc Obtiene comparación de ventas mensuales (últimos 12 meses vs año anterior)
 */
router.get('/dashboard/monthly-sales-comparison', InvoiceController.getMonthlySalesComparison);

export { router };
