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
}

export default new InvoiceController();
