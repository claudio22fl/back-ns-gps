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
 * @route GET /invoice
 * @desc Obtener todos los invoices con paginación
 * @query page - Número de página (default: 1)
 * @query limit - Cantidad de registros por página (default: 10)
 */
router.get('/', InvoiceController.getAllInvoices);

export { router };
