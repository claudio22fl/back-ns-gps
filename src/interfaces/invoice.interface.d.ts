export interface ProductInvoice {
  id: number;
  name: string;
  description: string;
  price: number;
  price_cost: number;
  stock: number;
  state: number;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
  cantidad: number;
  precioTotal: number;
}

export interface BankSelection {
  bancoId: number;
  nombreBanco: string;
  monto: number;
}

export interface PaymentData {
  transferencia: boolean;
  efectivo: boolean;
  pendiente: boolean;
  montoPagado: number;
  montoVuelto: number;
  bancosSeleccionados: BankSelection[];
  montoTransferencia: number;
  montoEfectivo: number;
  montoPendiente: number;
}

export interface CreateInvoicePayload {
  id_usuario: number;
  id_cliente: number;
  id_empresa?: number | null; // Empresa opcional
  fecha_venta: string;
  productos: ProductInvoice[];
  total: number;
  datos_pago: PaymentData;
  vendedor: string;
}

export interface InvoiceResponse {
  id: number;
  sale_id: number;
  invoice_number: string;
  issue_date: Date;
  total_amount: number;
  status: string;
  client: {
    id: number;
    name: string;
  };
  company: {
    id: number | null;
    name: string;
  };
  products: Array<{
    id: number;
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  payments: Array<{
    type: string;
    amount: number;
    bank?: string;
  }>;
}
