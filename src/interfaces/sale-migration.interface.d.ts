// Interfaces para migración de ventas desde sistema antiguo

export interface OldSaleData {
  factura: OldFactura;
  cliente: OldCliente;
  empresa: OldEmpresa;
  vendedor: string;
  detalle: OldDetalle[];
}

export interface OldFactura {
  nofactura: string;
  fecha: string;
  usuario: string;
  codcliente: string;
  codempresa: string;
  totalfactura: string;
  estado: string;
  fp: string;
  bancos: string; // JSON string: [{"nombre":"BancoBCI","valor":"60000"}]
  devolucion: string;
  direccion: string;
  Nota: string;
}

export interface OldCliente {
  idcliente: string;
  dni: string;
  nombre: string;
  telefono: string;
  direccion: string;
}

export interface OldEmpresa {
  idcliente: string;
  dni: string;
  nombre: string;
  telefono: string;
  direccion: string;
}

export interface OldDetalle {
  correlativo: string;
  nofactura: string;
  codproducto: string;
  cantidad: string;
  fp: string;
  precio_venta: string;
  precio_costo: string;
  precioTotal: string;
  producto: OldProducto;
}

export interface OldProducto {
  codigo: string;
  descripcion: string;
}

export interface MigrationRequest {
  ventas: OldSaleData[];
  overwrite?: boolean; // Si true, actualiza ventas existentes
}

export interface MigrationResponse {
  success: boolean;
  totalVentas: number;
  ventasMigradas: number;
  ventasOmitidas: number;
  errores: MigrationError[];
  detalles: {
    clientesCreados: number;
    empresasCreadas: number;
    productosCreados: number;
    usuariosCreados: number;
    bancosCreados: number;
  };
}

export interface MigrationError {
  nofactura: string;
  error: string;
  datos?: any;
}

export interface BankPayment {
  nombre: string;
  valor: string;
}
