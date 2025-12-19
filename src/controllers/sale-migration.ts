import { Request, Response } from 'express';
import { MigrationRequest } from '../interfaces/sale-migration.interface';
import { saleMigrationService } from '../services/sale-migration';
import { customResponse } from '../utils/customResponse';
import { handleHttp } from '../utils/error.handle';

/**
 * Migra ventas desde el sistema antiguo
 */
export const migrateSales = async (req: Request, res: Response) => {
  try {
    const migrationData: MigrationRequest = req.body;

    // Validaciones básicas
    if (!migrationData.ventas || !Array.isArray(migrationData.ventas)) {
      return customResponse({
        res,
        statusCode: 400,
        message: 'Debe proporcionar un array de ventas',
      });
    }

    if (migrationData.ventas.length === 0) {
      return customResponse({
        res,
        statusCode: 400,
        message: 'El array de ventas está vacío',
      });
    }

    console.log(`📥 Recibidas ${migrationData.ventas.length} ventas para migrar`);

    const result = await saleMigrationService.migrateSales(migrationData);

    const statusCode = result.errores.length === 0 ? 200 : 207; // 207 Multi-Status si hay errores parciales

    return customResponse({
      res,
      statusCode,
      data: result,
      message: `Migración completada: ${result.ventasMigradas} exitosas, ${result.ventasOmitidas} omitidas, ${result.errores.length} errores`,
    });
  } catch (error) {
    handleHttp(res, 'ERROR_MIGRATING_SALES', error);
  }
};

/**
 * Endpoint de prueba para validar estructura de datos
 */
export const validateMigrationData = async (req: Request, res: Response) => {
  try {
    const { ventas } = req.body;

    if (!ventas || !Array.isArray(ventas)) {
      return customResponse({
        res,
        statusCode: 400,
        message: 'Debe proporcionar un array de ventas',
      });
    }

    const validation = {
      totalVentas: ventas.length,
      ventasValidas: 0,
      ventasInvalidas: 0,
      errores: [] as any[],
    };

    ventas.forEach((venta, index) => {
      const errors = [];

      if (!venta.factura || !venta.factura.nofactura) {
        errors.push('Falta número de factura');
      }

      if (!venta.cliente || !venta.cliente.idcliente) {
        errors.push('Falta información del cliente');
      }

      if (!venta.detalle || venta.detalle.length === 0) {
        errors.push('Falta detalle de productos');
      }

      if (errors.length > 0) {
        validation.ventasInvalidas++;
        validation.errores.push({
          index,
          nofactura: venta.factura?.nofactura,
          errores: errors,
        });
      } else {
        validation.ventasValidas++;
      }
    });

    return customResponse({
      res,
      statusCode: 200,
      data: validation,
      message: `Validación completada: ${validation.ventasValidas} válidas, ${validation.ventasInvalidas} inválidas`,
    });
  } catch (error) {
    handleHttp(res, 'ERROR_VALIDATING_DATA', error);
  }
};
