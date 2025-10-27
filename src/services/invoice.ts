import { Transaction } from 'sequelize';
import { sequelize } from '../config/db';
import { CreateInvoicePayload, InvoiceResponse } from '../interfaces/invoice.interface';
import {
  Bank,
  Client,
  Company,
  Invoice,
  InvoiceDetail,
  InvoiceState,
  PaymentInvoice,
  Product,
  User,
} from '../models';

class InvoiceService {
  async createInvoice(payload: CreateInvoicePayload): Promise<InvoiceResponse> {
    const transaction: Transaction = await sequelize.transaction();

    try {
      // Verificar que el cliente existe
      const client = await Client.findByPk(payload.id_cliente);
      if (!client) {
        throw new Error(`Cliente con ID ${payload.id_cliente} no encontrado`);
      }

      // Verificar que la empresa existe (opcional)
      let company = null;
      if (payload.id_empresa) {
        company = await Company.findByPk(payload.id_empresa);
        if (!company) {
          throw new Error(`Empresa con ID ${payload.id_empresa} no encontrada`);
        }
      }

      // Verificar que el usuario existe
      const user = await User.findByPk(payload.id_usuario);
      if (!user) {
        throw new Error(`Usuario con ID ${payload.id_usuario} no encontrado`);
      }

      // Verificar stock disponible para todos los productos
      for (const producto of payload.productos) {
        const product = await Product.findByPk(producto.id);
        if (!product) {
          throw new Error(`Producto con ID ${producto.id} no encontrado`);
        }
        if (product.stock < producto.cantidad) {
          throw new Error(
            `Stock insuficiente para el producto ${product.name}. Stock disponible: ${product.stock}, cantidad solicitada: ${producto.cantidad}`
          );
        }
      }

      // Obtener el estado "Pagado" (ID 1 según los datos que vimos)
      const invoiceState = await InvoiceState.findByPk(1);
      if (!invoiceState) {
        throw new Error('Estado de invoice "Pagado" no encontrado');
      }

      // 1. Crear el invoice principal
      const invoice = await Invoice.create(
        {
          date: new Date(payload.fecha_venta),
          total: payload.total,
          'id_invoice-state': 1, // Estado "Pagado"
          is_return: false,
          id_client: payload.id_cliente,
          id_company: payload.id_empresa || null, // Puede ser null
          id_user: payload.id_usuario,
        },
        { transaction }
      );

      // 2. Crear los detalles del invoice (productos)
      const invoiceDetails = [];
      for (const producto of payload.productos) {
        const invoiceDetail = await InvoiceDetail.create(
          {
            id_invoice: invoice.id,
            is_fp: false, // Asumiendo que no es factura pendiente
            id_product: producto.id,
            quantity: producto.cantidad,
            reason: `Venta atendida por ${payload.vendedor}`,
            price_cost: producto.price_cost,
            price_sale: producto.price,
          },
          { transaction }
        );
        invoiceDetails.push(invoiceDetail);

        // Actualizar stock del producto
        const product = await Product.findByPk(producto.id, { transaction });
        if (product) {
          await product.update({ stock: product.stock - producto.cantidad }, { transaction });
        }
      }

      // 3. Crear los pagos basado en los booleanos
      const payments = [];
      const { datos_pago } = payload;

      // Pago por transferencia - guardar ID del banco como string
      if (datos_pago.transferencia && datos_pago.montoTransferencia > 0) {
        for (const banco of datos_pago.bancosSeleccionados) {
          const payment = await PaymentInvoice.create(
            {
              id_invoice: invoice.id,
              amount: banco.monto,
              id_bank: banco.bancoId.toString(), // Guardar ID del banco como string
            },
            { transaction }
          );
          payments.push(payment);
        }
      }

      // Pago en efectivo - guardar texto "efectivo"
      if (datos_pago.efectivo && datos_pago.montoEfectivo > 0) {
        const payment = await PaymentInvoice.create(
          {
            id_invoice: invoice.id,
            amount: datos_pago.montoEfectivo,
            id_bank: 'efectivo', // Texto directamente
          },
          { transaction }
        );
        payments.push(payment);
      }

      // Pago pendiente - guardar texto "pendiente"
      if (datos_pago.pendiente && datos_pago.montoPendiente > 0) {
        const payment = await PaymentInvoice.create(
          {
            id_invoice: invoice.id,
            amount: datos_pago.montoPendiente,
            id_bank: 'pendiente', // Texto directamente
          },
          { transaction }
        );
        payments.push(payment);
      }

      // Pago pendiente (no crear registro de pago si está pendiente)
      // Solo se registra cuando se complete el pago

      await transaction.commit();

      // Construir respuesta
      const response: InvoiceResponse = {
        id: invoice.id,
        sale_id: invoice.id, // El invoice ES la venta
        invoice_number: `INV-${invoice.id}`,
        issue_date: invoice.date || new Date(),
        total_amount: invoice.total || 0,
        status: invoiceState.name,
        client: {
          id: client.id,
          name: client.name || '',
        },
        company: company
          ? {
              id: company.id,
              name: company.name || '',
            }
          : {
              id: null,
              name: 'Sin empresa',
            },
        products: payload.productos.map((p) => ({
          id: p.id,
          name: p.name,
          quantity: p.cantidad,
          price: p.price,
          total: p.precioTotal,
        })),
        payments: payments.map((p) => {
          const paymentData: any = {
            amount: p.amount || 0,
          };

          // Determinar el tipo de pago basado en id_bank
          if (p.id_bank === 'efectivo') {
            paymentData.type = 'Efectivo';
            paymentData.method = 'efectivo';
          } else if (p.id_bank === 'pendiente') {
            paymentData.type = 'Pendiente';
            paymentData.method = 'pendiente';
          } else if (p.id_bank && !isNaN(Number(p.id_bank))) {
            // Es un ID de banco (número convertido a string)
            paymentData.type = 'Transferencia';
            paymentData.method = 'transferencia';

            // Buscar el nombre del banco
            const selectedBank = datos_pago.bancosSeleccionados.find(
              (b) => b.bancoId === Number(p.id_bank)
            );
            if (selectedBank) {
              paymentData.bank = selectedBank.nombreBanco;
            }
          }

          return paymentData;
        }),
      };

      return response;
    } catch (error) {
      await transaction.rollback();
      console.error('Error creando invoice:', error);
      throw error;
    }
  }

  async getInvoiceById(id: number): Promise<InvoiceResponse | null> {
    try {
      const invoice: any = await Invoice.findByPk(id, {
        include: [
          {
            model: Client,
            as: 'client',
            attributes: ['id', 'name'],
          },
          {
            model: Company,
            as: 'company',
            attributes: ['id', 'name'],
          },
          {
            model: InvoiceDetail,
            as: 'invoiceDetails',
            include: [
              {
                model: Product,
                as: 'product',
                attributes: ['id', 'name'],
              },
            ],
          },
          {
            model: PaymentInvoice,
            as: 'payments',
            attributes: ['amount', 'id_bank'],
            include: [
              {
                model: Bank,
                as: 'bank',
                attributes: ['id', 'name'],
                required: false, // LEFT JOIN para que no falle si id_bank es texto
              },
            ],
          },
          {
            model: InvoiceState,
            as: 'invoiceState',
            attributes: ['name'],
          },
        ],
      });

      if (!invoice) {
        return null;
      }

      const response: InvoiceResponse = {
        id: invoice.id,
        sale_id: invoice.id,
        invoice_number: `INV-${invoice.id}`,
        issue_date: invoice.date || new Date(),
        total_amount: invoice.total || 0,
        status: invoice.invoiceState?.name || 'Unknown',
        client: {
          id: invoice.client?.id || 0,
          name: invoice.client?.name || '',
        },
        company: {
          id: invoice.company?.id || 0,
          name: invoice.company?.name || '',
        },
        products:
          invoice.invoiceDetails?.map((detail: any) => ({
            id: detail.product?.id || 0,
            name: detail.product?.name || '',
            quantity: detail.quantity || 0,
            price: detail.price_sale || 0,
            total: (detail.quantity || 0) * (detail.price_sale || 0),
          })) || [],
        payments:
          invoice.payments?.map((p: any) => {
            const payment: any = {
              amount: p.amount || 0,
            };

            // Determinar el tipo basado en id_bank
            if (p.id_bank === 'efectivo') {
              payment.type = 'Efectivo';
              payment.method = 'efectivo';
            } else if (p.id_bank === 'pendiente') {
              payment.type = 'Pendiente';
              payment.method = 'pendiente';
            } else if (p.id_bank && !isNaN(Number(p.id_bank))) {
              // Es un ID de banco
              payment.type = 'Transferencia';
              payment.method = 'transferencia';
              payment.bank = p.bank?.name || undefined;
            }

            return payment;
          }) || [],
      };

      return response;
    } catch (error) {
      console.error('Error obteniendo invoice:', error);
      throw error;
    }
  }

  async getAllInvoices(page: number = 1, limit: number = 10) {
    try {
      const offset = (page - 1) * limit;

      const { count, rows } = await Invoice.findAndCountAll({
        offset,
        limit,
        include: [
          {
            model: Client,
            as: 'client',
            attributes: ['id', 'name', 'dni'],
          },
          {
            model: Company,
            as: 'company',
            attributes: ['id', 'name', 'dni'],
          },
          {
            model: User,
            as: 'seller',
            attributes: ['id', 'name'],
          },
          {
            model: InvoiceState,
            as: 'invoiceState',
            attributes: ['name'],
          },
          {
            model: PaymentInvoice,
            as: 'payments',
            attributes: ['amount', 'id_bank'],
            include: [
              {
                model: Bank,
                as: 'bank',
                attributes: ['name'],
                required: false, // LEFT JOIN para que no falle si id_bank es texto
              },
            ],
          },
          {
            model: InvoiceDetail,
            as: 'invoiceDetails',
            attributes: ['quantity'],
          },
        ],
        order: [['created_at', 'DESC']],
      });

      const invoices = rows.map((invoice: any) => {
        // Calcular método de pago dominante
        let metodoPago = 'Efectivo';
        let montoMetodo = 0;

        if (invoice.payments && invoice.payments.length > 0) {
          const efectivo = invoice.payments
            .filter((p: any) => p.id_bank === 'efectivo')
            .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
          const pendiente = invoice.payments
            .filter((p: any) => p.id_bank === 'pendiente')
            .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
          const transferencia = invoice.payments
            .filter((p: any) => p.id_bank && !isNaN(Number(p.id_bank)))
            .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

          if (transferencia > efectivo && transferencia > pendiente) {
            const bankPayment = invoice.payments.find(
              (p: any) => p.id_bank && !isNaN(Number(p.id_bank))
            );
            metodoPago = `Banco${bankPayment?.bank?.name ? ` ${bankPayment.bank.name.slice(0, 3)}` : ''}:`;
            montoMetodo = transferencia;
          } else if (pendiente > 0 && pendiente >= efectivo) {
            metodoPago = 'Pendiente:';
            montoMetodo = pendiente;
          } else if (efectivo > 0) {
            metodoPago = 'Efectivo:';
            montoMetodo = efectivo;
          }
        }

        // Calcular total de productos
        const totalProductos =
          invoice.invoiceDetails?.reduce(
            (sum: number, detail: any) => sum + (detail.quantity || 0),
            0
          ) || 0;

        // Construir información detallada de pagos
        const pagosDetalle =
          invoice.payments?.map((p: any) => {
            const pago: any = {
              amount: p.amount || 0,
              formatted_amount: `$${(p.amount || 0).toLocaleString()}`,
            };

            // Mejorar detección de tipo de pago
            if (p.id_bank === 'efectivo') {
              pago.type = 'Efectivo';
              pago.method = 'efectivo';
              pago.bank_name = 'Efectivo';
            } else if (p.id_bank === 'pendiente') {
              pago.type = 'Pendiente';
              pago.method = 'pendiente';
              pago.bank_name = 'Pendiente';
            } else if (p.id_bank && !isNaN(Number(p.id_bank))) {
              pago.type = 'Transferencia';
              pago.method = 'transferencia';
              pago.bank_name = p.bank?.name || `Banco ID: ${p.id_bank}`;
              pago.bank_id = Number(p.id_bank);
            } else {
              // Fallback para pagos sin tipo definido (probablemente efectivo)
              pago.type = 'Efectivo';
              pago.method = 'efectivo';
              pago.bank_name = 'Efectivo';
            }

            return pago;
          }) || [];

        return {
          // Info básica
          id: invoice.id,
          ticket: invoice.id,
          numero: `INV-${invoice.id}`,
          fecha: new Date(invoice.date || invoice.created_at).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          }),
          hora: new Date(invoice.date || invoice.created_at).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          estado: invoice.invoiceState?.name || 'Unknown',

          // Montos
          total: invoice.total || 0,
          total_formatted: `$${(invoice.total || 0).toLocaleString()}`,
          metodo_pago: metodoPago,
          monto_metodo: montoMetodo > 0 ? `$${montoMetodo.toLocaleString()}` : '',

          // Personas
          vendedor: invoice.seller?.name || 'NO REGISTRADO',
          cliente: {
            id: invoice.client?.id || 0,
            nombre: invoice.client?.name || 'NO REGISTRADO',
            dni: invoice.client?.dni || 'NO REGISTRADO',
          },
          empresa: {
            id: invoice.company?.id || 0,
            nombre: invoice.company?.name || 'NO REGISTRADO',
            dni: invoice.company?.dni || 'NO REGISTRADO',
          },

          // Productos y pagos
          productos: totalProductos,
          pagos: pagosDetalle,
          total_pagos: pagosDetalle.length,

          // Acciones
          acciones: 'Ver/Editar/Eliminar',
        };
      });

      return {
        data: invoices,
        pagination: {
          total: count,
          page,
          limit,
          totalPage: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      console.error('Error obteniendo invoices:', error);
      throw error;
    }
  }
}

export default new InvoiceService();
