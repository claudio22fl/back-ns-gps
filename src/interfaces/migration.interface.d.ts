// Interfaces para migración de datos del sistema antiguo

export interface OldSaleData {
  factura: OldInvoice;
  cliente: OldClient;
  empresa: OldCompany;
  vendedor: string;
  detalle: OldInvoiceDetail[];
}

export interface OldInvoice {
  nofactura: string;
  fecha: string;
  usuario: string;
  codcliente: string;
  codempresa: string;
  totalfactura: string;
  estado: string;
  fp: string;
  bancos: string; // JSON stringificado
  devolucion: string;
  direccion: string;
  Nota: string;
}

export interface OldClient {
  idcliente: string;
  dni: string;
  nombre: string;
  telefono: string;
  direccion: string;
}

export interface OldCompany {
  idcliente: string;
  dni: string;
  nombre: string;
  telefono: string;
  direccion: string;
}

export interface OldInvoiceDetail {
  correlativo: string;
  nofactura: string;
  codproducto: string;
  cantidad: string;
  fp: string;
  precio_venta: string;
  precio_costo: string;
  precioTotal: string;
  producto: OldProduct;
}

export interface OldProduct {
  codigo: string;
  descripcion: string;
}

export interface OldBankPayment {
  nombre: string;
  valor: string;
}

export interface MigrationResponse {
  success: boolean;
  message: string;
  stats: {
    totalReceived: number;
    created: number;
    updated: number;
    skipped: number;
    errors: number;
  };
  errors?: Array<{
    invoice: string;
    error: string;
  }>;
}
