import { Request, Response } from 'express';
import { CreateInvoicePayload } from '../interfaces/invoice.interface';
import InvoiceService from '../services/invoice';
import { customResponse } from '../utils/customResponse';
import { handleHttp } from '../utils/error.handle';

class InvoiceController {
  async createInvoice(req: Request, res: Response) {
    try {
      const payload: CreateInvoicePayload = req.body;

      // Validaciones básicas
      if (!payload.id_usuario || !payload.id_cliente) {
        return customResponse({
          res,
          statusCode: 400,
          message: 'Faltan campos obligatorios: id_usuario, id_cliente',
        });
      }

      if (!payload.productos || payload.productos.length === 0) {
        return customResponse({
          res,
          statusCode: 400,
          message: 'Debe incluir al menos un producto',
        });
      }

      if (!payload.datos_pago) {
        return customResponse({
          res,
          statusCode: 400,
          message: 'Debe incluir datos de pago',
        });
      }

      // Validar que el total coincida con la suma de productos
      const totalCalculado = payload.productos.reduce((sum, p) => sum + p.precioTotal, 0);
      if (Math.abs(totalCalculado - payload.total) > 0.01) {
        return customResponse({
          res,
          statusCode: 400,
          message: 'El total no coincide con la suma de los productos',
        });
      }

      const invoice = await InvoiceService.createInvoice(payload);

      return customResponse({
        res,
        statusCode: 201,
        data: invoice,
        message: 'Invoice creado exitosamente',
      });
    } catch (error: any) {
      console.error('Error en createInvoice:', error);

      if (error.message.includes('no encontrado') || error.message.includes('Stock insuficiente')) {
        return customResponse({
          res,
          statusCode: 400,
          message: error.message,
        });
      }

      return handleHttp(res, 'ERROR_CREATE_INVOICE', error);
    }
  }

  async getInvoiceById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const invoiceId = parseInt(id);

      if (isNaN(invoiceId)) {
        return customResponse({
          res,
          statusCode: 400,
          message: 'ID de invoice inválido',
        });
      }

      const invoice = await InvoiceService.getInvoiceById(invoiceId);

      if (!invoice) {
        return customResponse({
          res,
          statusCode: 404,
          message: 'Invoice no encontrado',
        });
      }

      return customResponse({
        res,
        statusCode: 200,
        data: invoice,
        message: 'Invoice encontrado',
      });
    } catch (error) {
      console.error('Error en getInvoiceById:', error);
      return handleHttp(res, 'ERROR_GET_INVOICE', error);
    }
  }

  async getAllInvoices(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (page < 1 || limit < 1) {
        return customResponse({
          res,
          statusCode: 400,
          message: 'Page y limit deben ser números positivos',
        });
      }

      const result = await InvoiceService.getAllInvoices(page, limit);

      return customResponse({
        res,
        statusCode: 200,
        data: result.data,
        message: 'Invoices obtenidos exitosamente',
        pagination: result.pagination,
      });
    } catch (error) {
      console.error('Error en getAllInvoices:', error);
      return handleHttp(res, 'ERROR_GET_INVOICES', error);
    }
  }

  async generateInvoicePDF(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const invoiceId = parseInt(id);

      if (isNaN(invoiceId)) {
        return customResponse({
          res,
          statusCode: 400,
          message: 'ID de invoice inválido',
        });
      }

      const pdfBase64 = await InvoiceService.generateInvoicePDF(invoiceId);

      if (!pdfBase64) {
        return customResponse({
          res,
          statusCode: 404,
          message: 'Invoice no encontrado',
        });
      }

      return customResponse({
        res,
        statusCode: 200,
        data: {
          pdf_base64: pdfBase64,
          filename: `invoice_${invoiceId}.pdf`,
        },
        message: 'PDF de factura generado exitosamente',
      });
    } catch (error) {
      console.error('Error generando PDF:', error);
      return handleHttp(res, 'ERROR_GENERATE_PDF', error);
    }
  }

  // ==================== ENDPOINTS DASHBOARD ====================

  /**
   * GET /api/v1/invoice/dashboard/daily-metrics
   * Obtiene métricas del día actual
   */
  async getDailyMetrics(_req: Request, res: Response) {
    try {
      const metrics = await InvoiceService.getDailyMetrics();

      return customResponse({
        res,
        statusCode: 200,
        data: metrics,
        message: 'Métricas diarias obtenidas exitosamente',
      });
    } catch (error) {
      console.error('Error en getDailyMetrics:', error);
      return handleHttp(res, 'ERROR_GET_DAILY_METRICS', error);
    }
  }

  /**
   * GET /api/v1/invoice/dashboard/monthly-metrics
   * Obtiene métricas del mes actual
   */
  async getMonthlyMetrics(_req: Request, res: Response) {
    try {
      const metrics = await InvoiceService.getMonthlyMetrics();

      return customResponse({
        res,
        statusCode: 200,
        data: metrics,
        message: 'Métricas mensuales obtenidas exitosamente',
      });
    } catch (error) {
      console.error('Error en getMonthlyMetrics:', error);
      return handleHttp(res, 'ERROR_GET_MONTHLY_METRICS', error);
    }
  }

  /**
   * GET /api/v1/invoice/dashboard/daily-sales
   * Obtiene ventas diarias del mes actual
   */
  async getDailySalesOfMonth(_req: Request, res: Response) {
    try {
      const sales = await InvoiceService.getDailySalesOfMonth();

      return customResponse({
        res,
        statusCode: 200,
        data: sales,
        message: 'Ventas diarias obtenidas exitosamente',
      });
    } catch (error) {
      console.error('Error en getDailySalesOfMonth:', error);
      return handleHttp(res, 'ERROR_GET_DAILY_SALES', error);
    }
  }

  /**
   * GET /api/v1/invoice/dashboard/daily-sales-by-payment
   * Obtiene ventas diarias del mes con desglose por método de pago
   */
  async getDailySalesByPaymentMethod(_req: Request, res: Response) {
    try {
      const sales = await InvoiceService.getDailySalesByPaymentMethod();

      return customResponse({
        res,
        statusCode: 200,
        data: sales,
        message: 'Ventas por método de pago obtenidas exitosamente',
      });
    } catch (error) {
      console.error('Error en getDailySalesByPaymentMethod:', error);
      return handleHttp(res, 'ERROR_GET_PAYMENT_SALES', error);
    }
  }

  /**
   * GET /api/v1/invoice/dashboard/monthly-sales-comparison
   * Obtiene comparación de ventas mensuales con año anterior
   */
  async getMonthlySalesComparison(_req: Request, res: Response) {
    try {
      const sales = await InvoiceService.getMonthlySalesComparison();

      return customResponse({
        res,
        statusCode: 200,
        data: sales,
        message: 'Comparación mensual obtenida exitosamente',
      });
    } catch (error) {
      console.error('Error en getMonthlySalesComparison:', error);
      return handleHttp(res, 'ERROR_GET_MONTHLY_COMPARISON', error);
    }
  }

  /**
   * GET /api/v1/invoice/dashboard/all-metrics
   * Obtiene todas las métricas del dashboard en una sola llamada
   */
  async getAllDashboardMetrics(_req: Request, res: Response) {
    try {
      const metrics = await InvoiceService.getAllDashboardMetrics();

      return customResponse({
        res,
        statusCode: 200,
        data: metrics,
        message: 'Métricas del dashboard obtenidas exitosamente',
      });
    } catch (error) {
      console.error('Error en getAllDashboardMetrics:', error);
      return handleHttp(res, 'ERROR_GET_DASHBOARD_METRICS', error);
    }
  }
}

export default new InvoiceController();
