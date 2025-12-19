import { Op, Transaction } from 'sequelize';
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
        order: [['id', 'DESC']],
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

  async generateInvoicePDF(invoiceId: number): Promise<string | null> {
    try {
      // Obtener toda la información del invoice con relaciones
      const invoice: any = await Invoice.findByPk(invoiceId, {
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
                attributes: ['name'],
                required: false,
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

      // Generar PDF usando PDFKit
      const PDFDocument = require('pdfkit');
      const pdf = new PDFDocument({
        size: [226.77, 600], // 80mm ancho x 600px alto
        margins: { top: 10, bottom: 10, left: 10, right: 10 },
      });

      let buffers: Buffer[] = [];
      pdf.on('data', buffers.push.bind(buffers));

      return new Promise((resolve) => {
        pdf.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          const pdfBase64 = pdfBuffer.toString('base64');
          resolve(pdfBase64);
        });

        let currentY = 20;

        // Estado "VENTA" centrado en la parte superior
        const estado = invoice.invoiceState?.name || 'Pagado';
        const tienePagoPendiente = invoice.payments?.some((p: any) => p.id_bank === 'pendiente');

        pdf.fontSize(18).font('Helvetica-Bold');
        let estadoTexto = 'VENTA';
        if (tienePagoPendiente) {
          estadoTexto = 'VENTA PENDIENTE';
        } else if (estado.toLowerCase().includes('devolucion')) {
          estadoTexto = 'GARANTÍA';
        }

        pdf.text(estadoTexto, 0, currentY, { align: 'center', width: 226.77 });
        currentY += 25;

        // Ticket number alineado a la izquierda + Logo centrado
        pdf.fontSize(10).font('Helvetica-Bold');
        pdf.text(`Ticket: ${invoice.id}`, 10, currentY);

        try {
          const logoPath = require('path').join(__dirname, '../../public/img/logo.jpg');
          pdf.image(logoPath, 70, currentY, { width: 80, height: 40 });
          currentY += 50;
        } catch (error: any) {
          console.log('Logo no encontrado, continuando sin logo:', error.message);
          currentY += 20;
        }

        // Información de la empresa
        pdf.fontSize(8).font('Helvetica-Bold');
        pdf.text('RUT: ', 10, currentY, { continued: true });
        pdf.font('Helvetica').text('76.315.978-7');
        currentY += 12;

        pdf.font('Helvetica-Bold').text('Teléfono: ', 10, currentY, { continued: true });
        pdf.font('Helvetica').text('2147483647');
        currentY += 12;

        pdf.font('Helvetica-Bold').text('Dirección: ', 10, currentY, { continued: true });
        pdf.font('Helvetica').text('Dresden 4248, San Miguel');
        currentY += 12;

        // Fecha y hora
        const fecha = new Date(invoice.date || invoice.created_at);
        pdf.font('Helvetica-Bold').text('Fecha: ', 10, currentY, { continued: true });
        pdf.font('Helvetica').text(
          fecha.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })
        );
        currentY += 12;

        pdf.font('Helvetica-Bold').text('Hora: ', 10, currentY, { continued: true });
        pdf
          .font('Helvetica')
          .text(fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }));
        currentY += 20;

        // Cliente
        pdf.fontSize(9).font('Helvetica-Bold');
        pdf.text('CLIENTE _______________________', 10, currentY);
        currentY += 15;

        pdf.fontSize(8).font('Helvetica');
        pdf.text(`Nombre: ${invoice.client?.name || 'NO REGISTRADO'}`, 10, currentY);
        currentY += 12;
        pdf.text(`RUT: ${invoice.client?.dni || 'NO REGISTRADO'}`, 10, currentY);
        currentY += 20;

        // Empresa (si existe)
        if (invoice.company && invoice.company.name !== 'Sin empresa') {
          pdf.fontSize(9).font('Helvetica-Bold');
          pdf.text('EMPRESA _______________________', 10, currentY);
          currentY += 15;

          pdf.fontSize(8).font('Helvetica');
          pdf.text(`Nombre: ${invoice.company.name}`, 10, currentY);
          currentY += 12;
          pdf.text(`RUT: ${invoice.company.dni || 'NO REGISTRADO'}`, 10, currentY);
          currentY += 20;
        }

        // Productos
        pdf.fontSize(9).font('Helvetica-Bold');
        pdf.text('Detalle de Productos', 10, currentY);
        currentY += 15;

        // Encabezados de columnas con más espacio
        pdf.fontSize(8).font('Helvetica-Bold');
        pdf.text('Nombre', 10, currentY);
        pdf.text('Cant', 120, currentY); // Movido más a la izquierda
        pdf.text('Precio', 150, currentY); // Más espacio
        pdf.text('Total', 185, currentY); // Más espacio
        currentY += 12;

        invoice.invoiceDetails?.forEach((detail: any) => {
          const subtotal = (detail.quantity || 0) * (detail.price_sale || 0);
          const nombreProducto = detail.product?.name || 'Producto';

          // Nombre del producto (truncar para dejar espacio a las columnas)
          const nombre =
            nombreProducto.length > 15 ? nombreProducto.substring(0, 15) : nombreProducto;

          pdf.fontSize(8).font('Helvetica-Bold');
          pdf.text(nombre, 10, currentY);
          pdf.text(`${detail.quantity}`, 120, currentY);
          pdf.text(`$${(detail.price_sale || 0).toLocaleString()}`, 150, currentY);
          pdf.text(`$${subtotal.toLocaleString()}`, 185, currentY);
          currentY += 10;

          // Código del producto en línea separada si existe
          if (detail.product?.codigo) {
            pdf.fontSize(6).font('Helvetica');
            pdf.text(detail.product.codigo, 10, currentY);
            currentY += 8;
          }

          currentY += 2; // Espacio entre productos
        });

        currentY += 10;

        // Total
        pdf.fontSize(12).font('Helvetica-Bold');
        pdf.text(`TOTAL: $${(invoice.total || 0).toLocaleString()}`, 10, currentY, {
          align: 'right',
        });
        currentY += 25;

        // Métodos de pago
        pdf.fontSize(9).font('Helvetica-Bold');
        pdf.text('MÉTODO DE PAGO _______________', 10, currentY);
        currentY += 15;

        pdf.fontSize(8).font('Helvetica');
        invoice.payments?.forEach((payment: any) => {
          let metodoPago = '';
          if (payment.id_bank === 'Efectivo') {
            metodoPago = 'Efectivo';
          } else if (payment.id_bank === 'Pendiente') {
            metodoPago = 'Pendiente';
          } else if (payment.id_bank && !isNaN(Number(payment.id_bank))) {
            metodoPago = payment.bank?.name || 'Transferencia bancaria';
          } else {
            metodoPago = 'Método no especificado';
          }

          if (metodoPago) {
            pdf.text(`${metodoPago}: $${(payment.amount || 0).toLocaleString()}`, 10, currentY);
            currentY += 12;
          }
        });

        currentY += 10;

        // Vendedor
        pdf.fontSize(8).font('Helvetica');
        pdf.text(`Vendedor: ${invoice.seller?.name || 'NO REGISTRADO'}`, 10, currentY, {
          align: 'center',
        });

        // Estado ya se renderizó al inicio

        pdf.end();
      });
    } catch (error) {
      console.error('Error generando PDF:', error);
      throw error;
    }
  }

  // ==================== MÉTRICAS DEL DASHBOARD ====================

  /**
   * Obtiene las métricas del día actual (bruto, neto, comparación con ayer)
   */
  async getDailyMetrics() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      console.log('🔍 [DEBUG] Buscando ventas entre:', today, 'y', tomorrow);

      // Ventas del día actual (sin devoluciones)
      const todayInvoices = await Invoice.findAll({
        where: {
          date: {
            [Op.gte]: today,
            [Op.lt]: tomorrow,
          },
          is_return: false,
        },
        include: [
          {
            model: InvoiceDetail,
            as: 'invoiceDetails',
          },
          {
            model: PaymentInvoice,
            as: 'payments',
            include: [
              {
                model: Bank,
                as: 'bank',
              },
            ],
          },
        ],
      });

      console.log(`🔍 [DEBUG] Encontradas ${todayInvoices.length} ventas hoy`);

      // Ventas de ayer (sin devoluciones)
      const yesterdayInvoices = await Invoice.findAll({
        where: {
          date: {
            [Op.gte]: yesterday,
            [Op.lt]: today,
          },
          is_return: false,
        },
        include: [
          {
            model: InvoiceDetail,
            as: 'invoiceDetails',
          },
        ],
      });

      // Calcular totales de hoy
      const totalBrutoHoy = todayInvoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0);

      // Calcular total neto (sin IVA - asumiendo IVA del 19%)
      const totalNetoHoy = Math.round(totalBrutoHoy / 1.19);

      // Calcular totales de ayer
      const totalBrutoAyer = yesterdayInvoices.reduce(
        (sum, invoice) => sum + (invoice.total || 0),
        0
      );
      const totalNetoAyer = Math.round(totalBrutoAyer / 1.19);

      // Calcular porcentajes de cambio
      const cambioPercentBruto =
        totalBrutoAyer > 0 ? ((totalBrutoHoy - totalBrutoAyer) / totalBrutoAyer) * 100 : 0;
      const cambioPercentNeto =
        totalNetoAyer > 0 ? ((totalNetoHoy - totalNetoAyer) / totalNetoAyer) * 100 : 0;

      // Calcular pagos del día por tipo
      let pagoTransferencia = 0;
      let pagoEfectivo = 0;

      todayInvoices.forEach((invoice: any) => {
        invoice.payments?.forEach((payment: any) => {
          const amount = payment.amount || 0;
          const bankId = payment.id_bank;
          const bankName = payment.bank?.name?.toLowerCase() || '';

          console.log(
            `💰 [DEBUG] Payment: id_bank="${bankId}", bankName="${bankName}", amount=${amount}`
          );

          // Verificar si es efectivo (por texto o por nombre del banco)
          const isEfectivo =
            (bankId && bankId.toLowerCase() === 'efectivo') || bankName === 'efectivo';

          if (isEfectivo) {
            pagoEfectivo += amount;
            console.log(`✅ [DEBUG] Sumando a EFECTIVO: ${amount}`);
          } else if (bankId && bankId.toLowerCase() !== 'pendiente' && !isEfectivo) {
            pagoTransferencia += amount;
            console.log(`✅ [DEBUG] Sumando a TRANSFERENCIA: ${amount}`);
          }
        });
      });

      console.log(
        `🔍 [DEBUG] Total Efectivo: ${pagoEfectivo}, Total Transferencia: ${pagoTransferencia}`
      );

      return {
        totalBrutoHoy,
        totalNetoHoy,
        cambioPercentBruto: parseFloat(cambioPercentBruto.toFixed(2)),
        cambioPercentNeto: parseFloat(cambioPercentNeto.toFixed(2)),
        pagoTransferencia,
        pagoEfectivo,
      };
    } catch (error) {
      console.error('Error obteniendo métricas diarias:', error);
      throw error;
    }
  }

  /**
   * Obtiene las métricas del mes actual (bruto, neto, comparación con mes anterior)
   */
  async getMonthlyMetrics() {
    try {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstDayOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const firstDayOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Ventas del mes actual (sin devoluciones)
      const thisMonthInvoices = await Invoice.findAll({
        where: {
          date: {
            [Op.gte]: firstDayOfMonth,
            [Op.lt]: firstDayOfNextMonth,
          },
          is_return: false,
        },
        include: [
          {
            model: InvoiceDetail,
            as: 'invoiceDetails',
          },
        ],
      });

      // Ventas del mes pasado (sin devoluciones)
      const lastMonthInvoices = await Invoice.findAll({
        where: {
          date: {
            [Op.gte]: firstDayOfLastMonth,
            [Op.lt]: firstDayOfThisMonth,
          },
          is_return: false,
        },
        include: [
          {
            model: InvoiceDetail,
            as: 'invoiceDetails',
          },
        ],
      });

      // Calcular totales del mes actual
      const totalBrutoMes = thisMonthInvoices.reduce(
        (sum, invoice) => sum + (invoice.total || 0),
        0
      );
      const totalNetoMes = Math.round(totalBrutoMes / 1.19);
      const totalIvaMes = totalBrutoMes - totalNetoMes;

      // Calcular totales del mes pasado
      const totalBrutoMesPasado = lastMonthInvoices.reduce(
        (sum, invoice) => sum + (invoice.total || 0),
        0
      );
      const totalNetoMesPasado = Math.round(totalBrutoMesPasado / 1.19);

      // Calcular porcentajes de cambio
      const cambioPercentBruto =
        totalBrutoMesPasado > 0
          ? ((totalBrutoMes - totalBrutoMesPasado) / totalBrutoMesPasado) * 100
          : 0;
      const cambioPercentNeto =
        totalNetoMesPasado > 0
          ? ((totalNetoMes - totalNetoMesPasado) / totalNetoMesPasado) * 100
          : 0;

      return {
        ventaBrutaMensual: totalBrutoMes,
        ventaNetaMensual: totalNetoMes,
        totalIvaMes,
        totalMes: totalBrutoMes,
        cambioPercentBruto: parseFloat(cambioPercentBruto.toFixed(2)),
        cambioPercentNeto: parseFloat(cambioPercentNeto.toFixed(2)),
      };
    } catch (error) {
      console.error('Error obteniendo métricas mensuales:', error);
      throw error;
    }
  }

  /**
   * Obtiene las ventas diarias del mes actual (para gráfico de barras)
   */
  async getDailySalesOfMonth() {
    try {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstDayOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      // Obtener todas las ventas del mes
      const invoices = await Invoice.findAll({
        where: {
          date: {
            [Op.gte]: firstDayOfMonth,
            [Op.lt]: firstDayOfNextMonth,
          },
          is_return: false,
        },
        order: [['date', 'ASC']],
      });

      // Agrupar por día
      const salesByDay: { [key: string]: { bruto: number; neto: number } } = {};

      invoices.forEach((invoice) => {
        if (invoice.date) {
          const day = invoice.date.getDate();
          const key = `${day}-${now.getMonth() + 1}`;

          if (!salesByDay[key]) {
            salesByDay[key] = { bruto: 0, neto: 0 };
          }

          const bruto = invoice.total || 0;
          const neto = Math.round(bruto / 1.19);

          salesByDay[key].bruto += bruto;
          salesByDay[key].neto += neto;
        }
      });

      // Convertir a array
      const result = Object.entries(salesByDay).map(([date, totals]) => ({
        date,
        ventasBrutas: totals.bruto,
        ventasNetas: totals.neto,
      }));

      return result;
    } catch (error) {
      console.error('Error obteniendo ventas diarias del mes:', error);
      throw error;
    }
  }

  /**
   * Obtiene las ventas diarias del mes con desglose por método de pago
   */
  async getDailySalesByPaymentMethod() {
    try {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstDayOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      // Obtener todas las ventas del mes con sus pagos
      const invoices = await Invoice.findAll({
        where: {
          date: {
            [Op.gte]: firstDayOfMonth,
            [Op.lt]: firstDayOfNextMonth,
          },
          is_return: false,
        },
        include: [
          {
            model: PaymentInvoice,
            as: 'payments',
            include: [
              {
                model: Bank,
                as: 'bank',
              },
            ],
          },
        ],
        order: [['date', 'ASC']],
      });

      // Agrupar por día y método de pago
      const salesByDay: {
        [key: string]: {
          [paymentMethod: string]: number;
        };
      } = {};

      invoices.forEach((invoice: any) => {
        if (invoice.date) {
          const day = invoice.date.getDate();
          const key = `${day}-${now.getMonth() + 1}`;

          if (!salesByDay[key]) {
            salesByDay[key] = {};
          }

          // Procesar cada pago
          invoice.payments?.forEach((payment: any) => {
            const amount = payment.amount || 0;
            const bankId = payment.id_bank;

            let paymentMethodName = 'Otros';

            // Comparación case-insensitive
            if (bankId && bankId.toLowerCase() === 'efectivo') {
              paymentMethodName = 'Efectivo';
            } else if (bankId && bankId.toLowerCase() === 'pendiente') {
              paymentMethodName = 'Pendiente';
            } else if (payment.bank?.name) {
              paymentMethodName = payment.bank.name;
            } else if (bankId && !isNaN(Number(bankId))) {
              // Si es un ID numérico pero no hay banco asociado, marcarlo como "Transferencias"
              paymentMethodName = 'Transferencias';
            }

            if (!salesByDay[key][paymentMethodName]) {
              salesByDay[key][paymentMethodName] = 0;
            }

            salesByDay[key][paymentMethodName] += amount;
          });
        }
      });

      // Convertir a array
      const result = Object.entries(salesByDay).map(([date, payments]) => ({
        date,
        payments,
      }));

      return result;
    } catch (error) {
      console.error('Error obteniendo ventas por método de pago:', error);
      throw error;
    }
  }

  /**
   * Obtiene ventas mensuales comparativas (últimos 12 meses vs año anterior)
   */
  async getMonthlySalesComparison() {
    try {
      const now = new Date();
      const results = [];

      // Obtener últimos 12 meses
      for (let i = 11; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextMonthDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

        // Mes del año anterior
        const lastYearMonthDate = new Date(monthDate.getFullYear() - 1, monthDate.getMonth(), 1);
        const lastYearNextMonthDate = new Date(
          monthDate.getFullYear() - 1,
          monthDate.getMonth() + 1,
          1
        );

        // Ventas del mes actual
        const currentMonthInvoices = await Invoice.findAll({
          where: {
            date: {
              [Op.gte]: monthDate,
              [Op.lt]: nextMonthDate,
            },
            is_return: false,
          },
        });

        // Ventas del mismo mes año anterior
        const lastYearMonthInvoices = await Invoice.findAll({
          where: {
            date: {
              [Op.gte]: lastYearMonthDate,
              [Op.lt]: lastYearNextMonthDate,
            },
            is_return: false,
          },
        });

        const currentTotal = currentMonthInvoices.reduce(
          (sum, invoice) => sum + (invoice.total || 0),
          0
        );
        const lastYearTotal = lastYearMonthInvoices.reduce(
          (sum, invoice) => sum + (invoice.total || 0),
          0
        );

        const monthNames = [
          'Enero',
          'Febrero',
          'Marzo',
          'Abril',
          'Mayo',
          'Junio',
          'Julio',
          'Agosto',
          'Septiembre',
          'Octubre',
          'Noviembre',
          'Diciembre',
        ];

        results.push({
          month: monthNames[monthDate.getMonth()],
          year: monthDate.getFullYear(),
          currentYear: currentTotal,
          lastYear: lastYearTotal,
        });
      }

      return results;
    } catch (error) {
      console.error('Error obteniendo comparación mensual:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las métricas del dashboard en una sola llamada
   */
  async getAllDashboardMetrics() {
    try {
      const [dailyMetrics, monthlyMetrics, dailySales, dailySalesByPayment, monthlySales] =
        await Promise.all([
          this.getDailyMetrics(),
          this.getMonthlyMetrics(),
          this.getDailySalesOfMonth(),
          this.getDailySalesByPaymentMethod(),
          this.getMonthlySalesComparison(),
        ]);

      return {
        daily: dailyMetrics,
        monthly: monthlyMetrics,
        dailySalesChart: dailySales,
        dailyPaymentChart: dailySalesByPayment,
        monthlySalesChart: monthlySales,
      };
    } catch (error) {
      console.error('Error obteniendo métricas del dashboard:', error);
      throw error;
    }
  }
}

export default new InvoiceService();
