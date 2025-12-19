import { Request, Response } from 'express';
import { OldSaleData } from '../interfaces/migration.interface';
import { migrationService } from '../services/migration';
import { customResponse } from '../utils/customResponse';
import { handleHttp } from '../utils/error.handle';

export class MigrationController {
  /**
   * POST /api/v1/migration/sales
   * Recibe dump de ventas del sistema antiguo y las migra
   */
  async migrateSales(req: Request, res: Response) {
    try {
      const { data } = req.body;

      // Validar que venga el array de datos
      if (!data || !Array.isArray(data)) {
        return customResponse({
          res,
          statusCode: 400,
          message: 'Se requiere un array "data" con las ventas a migrar',
        });
      }

      console.log(`📦 Iniciando migración de ${data.length} ventas...`);

      const result = await migrationService.migrateSales(data as OldSaleData[]);

      console.log(`✅ Migración completada:`);
      console.log(`   - Creadas: ${result.stats.created}`);
      console.log(`   - Actualizadas: ${result.stats.updated}`);
      console.log(`   - Omitidas: ${result.stats.skipped}`);
      console.log(`   - Errores: ${result.stats.errors}`);

      customResponse({
        res,
        statusCode: result.success ? 200 : 207, // 207 Multi-Status si hay errores
        data: result,
        message: result.message,
      });
    } catch (error) {
      handleHttp(res, 'ERROR_MIGRATION_SALES', error);
    }
  }

  /**
   * GET /api/v1/migration/stats
   * Obtiene estadísticas de la base de datos actual
   */
  async getStats(_req: Request, res: Response) {
    try {
      const Client = (await import('../models/client')).default;
      const Company = (await import('../models/company')).default;
      const Product = (await import('../models/product')).default;
      const User = (await import('../models/user')).default;
      const Invoice = (await import('../models/invoice')).default;
      const InvoiceDetail = (await import('../models/invoice-detail')).default;
      const PaymentInvoice = (await import('../models/payment-invoice')).default;
      const Bank = (await import('../models/bank')).default;

      const [
        clientCount,
        companyCount,
        productCount,
        userCount,
        invoiceCount,
        detailCount,
        paymentCount,
        bankCount,
      ] = await Promise.all([
        Client.count(),
        Company.count(),
        Product.count(),
        User.count(),
        Invoice.count(),
        InvoiceDetail.count(),
        PaymentInvoice.count(),
        Bank.count(),
      ]);

      const stats = {
        clients: clientCount,
        companies: companyCount,
        products: productCount,
        users: userCount,
        invoices: invoiceCount,
        invoiceDetails: detailCount,
        payments: paymentCount,
        banks: bankCount,
      };

      customResponse({
        res,
        statusCode: 200,
        data: stats,
        message: 'Estadísticas de base de datos',
      });
    } catch (error) {
      handleHttp(res, 'ERROR_GET_STATS', error);
    }
  }
}

export const migrationController = new MigrationController();
