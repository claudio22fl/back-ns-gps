import { Transaction } from 'sequelize';
import { sequelize } from '../config/db';
import {
  BankPayment,
  MigrationError,
  MigrationRequest,
  MigrationResponse,
  OldSaleData,
} from '../interfaces/sale-migration.interface';
import { Bank } from '../models/bank';
import { Client } from '../models/client';
import { Company } from '../models/company';
import Invoice from '../models/invoice';
import InvoiceDetail from '../models/invoice-detail';
import InvoiceState from '../models/invoice-state';
import PaymentInvoice from '../models/payment-invoice';
import { Product } from '../models/product';
import { User } from '../models/user';

export class SaleMigrationService {
  /**
   * Migra ventas desde el sistema antiguo
   */
  async migrateSales(request: MigrationRequest): Promise<MigrationResponse> {
    const response: MigrationResponse = {
      success: true,
      totalVentas: request.ventas.length,
      ventasMigradas: 0,
      ventasOmitidas: 0,
      errores: [],
      detalles: {
        clientesCreados: 0,
        empresasCreadas: 0,
        productosCreados: 0,
        usuariosCreados: 0,
        bancosCreados: 0,
      },
    };

    console.log(`🚀 Iniciando migración de ${request.ventas.length} ventas...`);

    for (const venta of request.ventas) {
      try {
        // Si la factura está vacía, omitirla
        if (!venta.factura || !venta.factura.nofactura) {
          response.ventasOmitidas++;
          continue;
        }

        const ventaId = parseInt(venta.factura.nofactura);

        // Verificar si la venta ya existe
        const ventaExistente = await Invoice.findByPk(ventaId, { paranoid: false });

        if (ventaExistente && !request.overwrite) {
          console.log(`⏭️  Venta ${ventaId} ya existe, omitiendo...`);
          response.ventasOmitidas++;
          continue;
        }

        // Procesar venta con transacción
        await sequelize.transaction(async (transaction: Transaction) => {
          await this.processSale(venta, response, transaction, request.overwrite || false);
        });

        response.ventasMigradas++;
        console.log(`✅ Venta ${ventaId} migrada exitosamente`);
      } catch (error: any) {
        const errorData: MigrationError = {
          nofactura: venta.factura?.nofactura || 'DESCONOCIDO',
          error: error.message,
          datos: {
            cliente: venta.cliente?.nombre,
            empresa: venta.empresa?.nombre,
          },
        };
        response.errores.push(errorData);
        console.error(`❌ Error en venta ${errorData.nofactura}:`, error.message);
      }
    }

    console.log(`
🎉 Migración completada:
   ✅ Migradas: ${response.ventasMigradas}
   ⏭️  Omitidas: ${response.ventasOmitidas}
   ❌ Errores: ${response.errores.length}
   
   📊 Nuevos registros:
      👥 Clientes: ${response.detalles.clientesCreados}
      🏢 Empresas: ${response.detalles.empresasCreadas}
      📦 Productos: ${response.detalles.productosCreados}
      👤 Usuarios: ${response.detalles.usuariosCreados}
      🏦 Bancos: ${response.detalles.bancosCreados}
    `);

    return response;
  }

  /**
   * Procesa una venta individual
   */
  private async processSale(
    venta: OldSaleData,
    response: MigrationResponse,
    transaction: Transaction,
    overwrite: boolean
  ): Promise<void> {
    const ventaId = parseInt(venta.factura.nofactura);

    // 1. Obtener o crear Cliente
    const clientId = await this.getOrCreateClient(venta.cliente, response, transaction);

    // 2. Obtener o crear Empresa
    const companyId = await this.getOrCreateCompany(venta.empresa, response, transaction);

    // 3. Obtener o crear Usuario
    const userId = await this.getOrCreateUser(
      venta.factura.usuario,
      venta.vendedor,
      response,
      transaction
    );

    // 4. Asegurar que existe el estado de factura (Pagado)
    await this.ensureInvoiceState(transaction);

    // 5. Calcular total
    const total = parseInt(venta.factura.totalfactura);

    // 6. Crear o actualizar invoice
    const invoiceData = {
      id: ventaId,
      date: new Date(venta.factura.fecha),
      total,
      'id_invoice-state': parseInt(venta.factura.estado) || 1,
      is_return: venta.factura.devolucion === 'si',
      id_client: clientId,
      id_company: companyId || null,
      id_user: userId,
    };

    if (overwrite) {
      await Invoice.upsert(invoiceData, { transaction });
    } else {
      await Invoice.create(invoiceData, { transaction });
    }

    // 7. Eliminar detalles anteriores si es overwrite
    if (overwrite) {
      await InvoiceDetail.destroy({ where: { id_invoice: ventaId }, transaction, force: true });
    }

    // 8. Crear detalle de productos
    for (const detalle of venta.detalle) {
      const productId = await this.getOrCreateProduct(detalle, response, transaction);

      await InvoiceDetail.create(
        {
          id: parseInt(detalle.correlativo),
          id_invoice: ventaId,
          is_fp: detalle.fp === 'si',
          id_product: productId,
          quantity: parseInt(detalle.cantidad),
          reason: null,
          price_cost: parseInt(detalle.precio_costo),
          price_sale: parseInt(detalle.precio_venta),
        },
        { transaction }
      );
    }

    // 9. Eliminar pagos anteriores si es overwrite
    if (overwrite) {
      await PaymentInvoice.destroy({ where: { id_invoice: ventaId }, transaction, force: true });
    }

    // 10. Procesar bancos de pago
    await this.processBankPayments(venta.factura.bancos, ventaId, response, transaction);
  }

  /**
   * Obtiene o crea un cliente
   */
  private async getOrCreateClient(
    oldClient: any,
    response: MigrationResponse,
    transaction: Transaction
  ): Promise<number> {
    if (!oldClient || !oldClient.idcliente) {
      // Cliente por defecto
      return 1;
    }

    const clientId = parseInt(oldClient.idcliente);

    const existingClient = await Client.findByPk(clientId, { transaction, paranoid: false });

    if (existingClient) {
      return clientId;
    }

    // Crear nuevo cliente
    await Client.create(
      {
        id: clientId,
        dni: oldClient.dni || '',
        name: oldClient.nombre || 'CLIENTE IMPORTADO',
        phone: oldClient.telefono || '',
      },
      { transaction }
    );

    response.detalles.clientesCreados++;
    return clientId;
  }

  /**
   * Obtiene o crea una empresa
   */
  private async getOrCreateCompany(
    oldCompany: any,
    response: MigrationResponse,
    transaction: Transaction
  ): Promise<number | null> {
    if (
      !oldCompany ||
      !oldCompany.idcliente ||
      !oldCompany.nombre ||
      oldCompany.nombre.trim() === '' ||
      oldCompany.nombre === 'NO REGISTRADO'
    ) {
      return null;
    }

    const companyId = parseInt(oldCompany.idcliente);

    const existingCompany = await Company.findByPk(companyId, { transaction, paranoid: false });

    if (existingCompany) {
      return companyId;
    }

    // Crear nueva empresa
    await Company.create(
      {
        id: companyId,
        dni: oldCompany.dni || '',
        name: oldCompany.nombre,
        phone: oldCompany.telefono || '',
      },
      { transaction }
    );

    response.detalles.empresasCreadas++;
    return companyId;
  }

  /**
   * Obtiene o crea un usuario
   */
  private async getOrCreateUser(
    oldUserId: string,
    vendedor: string,
    response: MigrationResponse,
    transaction: Transaction
  ): Promise<number> {
    const userId = parseInt(oldUserId);

    const existingUser = await User.findByPk(userId, { transaction, paranoid: false });

    if (existingUser) {
      return userId;
    }

    // Crear nuevo usuario
    const username = vendedor || `USER_${userId}`;

    await User.create(
      {
        id: userId,
        username,
        password: 'MIGRATED_USER', // Password temporal
        name: username,
        email: `${username}@migrated.com`,
        id_type_user: 1, // Tipo de usuario por defecto
      },
      { transaction }
    );

    response.detalles.usuariosCreados++;
    return userId;
  }

  /**
   * Obtiene o crea un producto
   */
  private async getOrCreateProduct(
    detalle: any,
    response: MigrationResponse,
    transaction: Transaction
  ): Promise<number> {
    const productId = parseInt(detalle.codproducto);

    const existingProduct = await Product.findByPk(productId, { transaction, paranoid: false });

    if (existingProduct) {
      return productId;
    }

    // Crear nuevo producto
    await Product.create(
      {
        id: productId,
        name: detalle.producto?.codigo || `PROD_${productId}`,
        description: detalle.producto?.descripcion || 'PRODUCTO IMPORTADO',
        price_cost: parseInt(detalle.precio_costo || '0'),
        price: parseInt(detalle.precio_venta || '0'),
        stock: 0,
        state: true,
      },
      { transaction }
    );

    response.detalles.productosCreados++;
    return productId;
  }

  /**
   * Procesa los bancos de pago
   */
  private async processBankPayments(
    bancosJson: string,
    invoiceId: number,
    response: MigrationResponse,
    transaction: Transaction
  ): Promise<void> {
    try {
      const bancos: BankPayment[] = JSON.parse(bancosJson || '[]');

      for (const banco of bancos) {
        const bankId = await this.getOrCreateBank(banco.nombre, response, transaction);

        await PaymentInvoice.create(
          {
            id_invoice: invoiceId,
            amount: parseInt(banco.valor),
            id_bank: bankId.toString(),
          },
          { transaction }
        );
      }
    } catch (error) {
      // Si no puede parsear, continuar sin bancos
      console.warn('No se pudieron procesar bancos:', bancosJson);
    }
  }

  /**
   * Obtiene o crea un banco
   */
  private async getOrCreateBank(
    bankName: string,
    response: MigrationResponse,
    transaction: Transaction
  ): Promise<number> {
    // Buscar banco por nombre
    const existingBank = await Bank.findOne({
      where: { name: bankName },
      transaction,
      paranoid: false,
    });

    if (existingBank) {
      return existingBank.id;
    }

    // Crear nuevo banco
    const newBank = await Bank.create(
      {
        name: bankName,
      },
      { transaction }
    );

    response.detalles.bancosCreados++;
    return newBank.id;
  }

  /**
   * Asegura que existe el estado de factura
   */
  private async ensureInvoiceState(transaction: Transaction): Promise<void> {
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

export const saleMigrationService = new SaleMigrationService();
