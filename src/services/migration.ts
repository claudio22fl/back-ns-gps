import { sequelize } from '../config/db';
import { MigrationResponse, OldBankPayment, OldSaleData } from '../interfaces/migration.interface';
import Bank from '../models/bank';
import Client from '../models/client';
import Company from '../models/company';
import Invoice from '../models/invoice';
import InvoiceDetail from '../models/invoice-detail';
import InvoiceState from '../models/invoice-state';
import PaymentInvoice from '../models/payment-invoice';
import Product from '../models/product';
import User from '../models/user';

export class MigrationService {
  /**
   * Migra ventas del sistema antiguo preservando IDs originales
   * Usa UPSERT para poder ejecutarse múltiples veces
   */
  async migrateSales(salesData: OldSaleData[]): Promise<MigrationResponse> {
    const stats = {
      totalReceived: salesData.length,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: 0,
    };

    const errors: Array<{ invoice: string; error: string }> = [];

    for (const sale of salesData) {
      // Saltar ventas vacías
      if (!sale.factura || !sale.factura.nofactura) {
        stats.skipped++;
        continue;
      }

      const transaction = await sequelize.transaction();

      try {
        // 1. Crear/Actualizar Cliente
        const clientId = await this.upsertClient(
          sale.cliente,
          parseInt(sale.factura.usuario),
          transaction
        );

        // 2. Crear/Actualizar Empresa
        const companyId = await this.upsertCompany(
          sale.empresa,
          parseInt(sale.factura.usuario),
          transaction
        );

        // 3. Crear/Actualizar Usuario (vendedor)
        const userId = await this.upsertUser(
          parseInt(sale.factura.usuario),
          sale.vendedor,
          transaction
        );

        // 4. Verificar que existe el estado de factura
        await this.ensureInvoiceState(transaction);

        // 5. Crear/Actualizar Invoice (preservando ID original)
        const invoiceId = parseInt(sale.factura.nofactura);
        const existingInvoice = await Invoice.findByPk(invoiceId, { transaction });

        const invoiceData = {
          id: invoiceId,
          date: new Date(sale.factura.fecha),
          total: parseInt(sale.factura.totalfactura),
          'id_invoice-state': parseInt(sale.factura.estado),
          is_return: sale.factura.devolucion === 'si',
          id_client: clientId,
          id_company: companyId,
          id_user: userId,
        };

        if (existingInvoice) {
          await existingInvoice.update(invoiceData, { transaction });
          stats.updated++;
        } else {
          await Invoice.create(invoiceData, { transaction });
          stats.created++;
        }

        // 6. Eliminar detalles antiguos de la factura para reemplazarlos
        await InvoiceDetail.destroy({
          where: { id_invoice: invoiceId },
          force: true,
          transaction,
        });

        // 7. Crear detalles de factura
        for (const detail of sale.detalle) {
          if (!detail.producto) continue;

          // Crear/actualizar producto
          const productId = await this.upsertProduct(detail, transaction);

          await InvoiceDetail.create(
            {
              id: parseInt(detail.correlativo),
              id_invoice: invoiceId,
              is_fp: detail.fp === 'si',
              id_product: productId,
              quantity: parseInt(detail.cantidad),
              reason: null,
              price_cost: parseInt(detail.precio_costo),
              price_sale: parseInt(detail.precio_venta),
            },
            { transaction }
          );
        }

        // 8. Eliminar pagos antiguos para reemplazarlos
        await PaymentInvoice.destroy({
          where: { id_invoice: invoiceId },
          force: true,
          transaction,
        });

        // 9. Crear pagos de factura
        if (sale.factura.bancos) {
          const payments: OldBankPayment[] = JSON.parse(sale.factura.bancos);

          for (const payment of payments) {
            // Crear/obtener banco
            const bankId = await this.upsertBank(payment.nombre, transaction);

            await PaymentInvoice.create(
              {
                id_invoice: invoiceId,
                amount: parseInt(payment.valor),
                id_bank: bankId.toString(),
              },
              { transaction }
            );
          }
        }

        await transaction.commit();
      } catch (error: any) {
        await transaction.rollback();
        console.error(`❌ Error en factura ${sale.factura.nofactura}:`, error.message);
        errors.push({
          invoice: sale.factura.nofactura,
          error: error.message,
        });
        stats.errors++;
      }
    }

    return {
      success: stats.errors === 0,
      message: `Migración completada: ${stats.created} creadas, ${stats.updated} actualizadas, ${stats.skipped} omitidas, ${stats.errors} errores`,
      stats,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Crea o actualiza cliente preservando ID original
   */
  private async upsertClient(oldClient: any, userId: number, transaction: any): Promise<number> {
    if (!oldClient || !oldClient.idcliente) {
      return 1; // Cliente por defecto
    }

    const clientId = parseInt(oldClient.idcliente);

    const [client] = await Client.upsert(
      {
        id: clientId,
        id_user: userId,
        dni: oldClient.dni || null,
        name: oldClient.nombre || 'SIN NOMBRE',
        phone: oldClient.telefono || null,
      },
      { transaction }
    );

    return client.id;
  }

  /**
   * Crea o actualiza empresa preservando ID original
   */
  private async upsertCompany(oldCompany: any, userId: number, transaction: any): Promise<number> {
    if (!oldCompany || !oldCompany.idcliente) {
      return 1; // Empresa por defecto
    }

    const companyId = parseInt(oldCompany.idcliente);

    // Si no tiene nombre, usar "NO REGISTRADO"
    const companyName =
      oldCompany.nombre && oldCompany.nombre.trim() !== '' ? oldCompany.nombre : 'NO REGISTRADO';

    const [company] = await Company.upsert(
      {
        id: companyId,
        id_user: userId,
        dni: oldCompany.dni || null,
        name: companyName,
        phone: oldCompany.telefono || null,
      },
      { transaction }
    );

    return company.id;
  }

  /**
   * Crea o actualiza usuario preservando ID original
   */
  private async upsertUser(userId: number, vendorName: string, transaction: any): Promise<number> {
    if (!userId) {
      userId = 1; // Usuario por defecto
    }

    const existingUser = await User.findByPk(userId, { transaction });

    if (!existingUser) {
      // Crear usuario con datos mínimos
      const username = `user_${userId}`;
      const email = `${username}@migrated.com`;

      await User.create(
        {
          id: userId,
          id_type_user: 1, // Tipo por defecto
          name: vendorName || 'VENDEDOR MIGRADO',
          email,
          username,
          password: 'MIGRATED', // Password temporal
        },
        { transaction }
      );
    }

    return userId;
  }

  /**
   * Crea o actualiza producto preservando ID original
   */
  private async upsertProduct(detail: any, transaction: any): Promise<number> {
    if (!detail.codproducto || !detail.producto) {
      throw new Error('Producto inválido');
    }

    const productId = parseInt(detail.codproducto);
    const productCode = detail.producto.codigo || 'SIN-CODIGO';
    const productDesc = detail.producto.descripcion || 'SIN DESCRIPCION';

    const [product] = await Product.upsert(
      {
        id: productId,
        name: productCode,
        description: productDesc,
        price: parseInt(detail.precio_venta) || 0,
        price_cost: parseInt(detail.precio_costo) || 0,
        stock: 0, // Stock inicial
        state: true,
      },
      { transaction }
    );

    return product.id;
  }

  /**
   * Crea o obtiene banco
   */
  private async upsertBank(bankName: string, transaction: any): Promise<number> {
    // Mapeo de nombres de banco del sistema antiguo
    const bankNameMap: { [key: string]: string } = {
      BancoChile: 'Banco de Chile',
      BancoBCI: 'BCI',
      BancoItau: 'Itaú',
      BancoScoti: 'Scotiabank',
      BancoEstado: 'BancoEstado',
      Efectivo: 'Efectivo',
    };

    const normalizedName = bankNameMap[bankName] || bankName;

    const [bank] = await Bank.findOrCreate({
      where: { name: normalizedName },
      defaults: { name: normalizedName },
      transaction,
    });

    return bank.id;
  }

  /**
   * Asegura que existe el estado de factura
   */
  private async ensureInvoiceState(transaction: any): Promise<void> {
    await InvoiceState.findOrCreate({
      where: { id: 1 },
      defaults: {
        id: 1,
        name: 'Pagado',
        description: 'Factura pagada',
        state: true,
      },
      transaction,
    });
  }
}

export const migrationService = new MigrationService();
