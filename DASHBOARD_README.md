    # 📊 Dashboard de Ventas - Backend API

Sistema completo de endpoints para visualizar métricas y estadísticas de ventas en tiempo real.

## ✅ Implementación Completada

Se han creado **6 endpoints** nuevos en el módulo de invoices para obtener todas las métricas necesarias para el dashboard mostrado en las imágenes.

### Archivos Modificados/Creados

- ✅ [src/services/invoice.ts](src/services/invoice.ts) - 6 métodos nuevos
- ✅ [src/controllers/invoice.ts](src/controllers/invoice.ts) - 6 controladores nuevos
- ✅ [src/routes/invoice.ts](src/routes/invoice.ts) - 6 rutas nuevas
- 📄 [DASHBOARD_API.md](DASHBOARD_API.md) - Documentación completa de la API
- 📄 [FRONTEND_EXAMPLE.tsx](FRONTEND_EXAMPLE.tsx) - Ejemplo de implementación React

---

## 🚀 Endpoints Disponibles

### Base URL

```
http://localhost:3000/api/v1/invoice/dashboard
```

### 1. **GET `/all-metrics`** ⭐ RECOMENDADO

Obtiene todas las métricas en una sola llamada (optimizado).

**Response incluye:**

- Métricas del día actual
- Métricas del mes actual
- Ventas diarias del mes (gráfico de barras)
- Ventas por método de pago (gráfico apilado)
- Comparación mensual con año anterior (gráfico de líneas)

### 2. **GET `/daily-metrics`**

Métricas del día actual:

- Total bruto y neto
- Comparación con ayer (%)
- Pago por transferencia y efectivo

### 3. **GET `/monthly-metrics`**

Métricas del mes actual:

- Venta bruta y neta
- Total IVA
- Comparación con mes anterior (%)

### 4. **GET `/daily-sales`**

Ventas diarias del mes (bruto/neto) para gráfico de barras.

### 5. **GET `/daily-sales-by-payment`**

Ventas diarias con desglose por método de pago (barras apiladas).

### 6. **GET `/monthly-sales-comparison`**

Últimos 12 meses vs mismo período año anterior.

---

## 📋 Datos Calculados

### Métricas Implementadas

| Métrica                  | Descripción                              | Fuente                      |
| ------------------------ | ---------------------------------------- | --------------------------- |
| **Total Bruto Hoy**      | Suma de `invoice.total` del día          | `Invoice.date = hoy`        |
| **Total Neto Hoy**       | Bruto / 1.19 (sin IVA)                   | Calculado                   |
| **Comparación con Ayer** | % de cambio vs día anterior              | Calculado                   |
| **Pago Transferencia**   | Suma de pagos con `id_bank` numérico     | `PaymentInvoice`            |
| **Pago Efectivo**        | Suma de pagos con `id_bank = "efectivo"` | `PaymentInvoice`            |
| **Venta Bruta Mensual**  | Suma de `invoice.total` del mes          | `Invoice.date = mes actual` |
| **Venta Neta Mensual**   | Bruto mensual / 1.19                     | Calculado                   |
| **Total IVA Mes**        | Bruto - Neto                             | Calculado                   |
| **Comparación Mensual**  | % de cambio vs mes anterior              | Calculado                   |

### Exclusiones

- ❌ Invoices con `is_return = true` (devoluciones)
- ❌ Invoices eliminados (`deleted_at != NULL`)

---

## 🎨 Uso en Frontend

### Opción 1: Una sola llamada (Recomendado)

```typescript
const response = await fetch('http://localhost:3000/api/v1/invoice/dashboard/all-metrics');
const { data } = await response.json();

// Usar data.daily, data.monthly, data.dailySalesChart, etc.
```

### Opción 2: Llamadas individuales

```typescript
const [daily, monthly] = await Promise.all([
  fetch('/api/v1/invoice/dashboard/daily-metrics').then((r) => r.json()),
  fetch('/api/v1/invoice/dashboard/monthly-metrics').then((r) => r.json()),
]);
```

Ver [FRONTEND_EXAMPLE.tsx](FRONTEND_EXAMPLE.tsx) para implementación completa con React + Chart.js.

---

## 📊 Ejemplo de Response

### GET `/dashboard/all-metrics`

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Métricas del dashboard obtenidas exitosamente",
  "data": {
    "daily": {
      "totalBrutoHoy": 2180550,
      "totalNetoHoy": 802290,
      "cambioPercentBruto": -50.71,
      "cambioPercentNeto": -50.71,
      "pagoTransferencia": 1699950,
      "pagoEfectivo": 530600
    },
    "monthly": {
      "ventaBrutaMensual": 90012792,
      "ventaNetaMensual": 31382822,
      "totalIvaMes": 4991944,
      "totalMes": 90012792,
      "cambioPercentBruto": -18.46,
      "cambioPercentNeto": -18.46
    },
    "dailySalesChart": [
      { "date": "1-12", "ventasBrutas": 8156500, "ventasNetas": 2392650 },
      { "date": "2-12", "ventasBrutas": 10234000, "ventasNetas": 3001234 }
    ],
    "dailyPaymentChart": [
      {
        "date": "9-12",
        "payments": {
          "Transferencias": 8156500,
          "BancoChile": 2243400,
          "Efectivo": 368300
        }
      }
    ],
    "monthlySalesChart": [
      { "month": "Enero", "year": 2024, "currentYear": 500000000, "lastYear": 450000000 }
    ]
  }
}
```

---

## 🔧 Tecnologías Utilizadas

- **Sequelize ORM** - Consultas a base de datos
- **TypeScript** - Tipado fuerte
- **Express** - API REST
- **MySQL** - Base de datos

---

## 📚 Documentación Adicional

- [DASHBOARD_API.md](DASHBOARD_API.md) - Documentación detallada de cada endpoint
- [FRONTEND_EXAMPLE.tsx](FRONTEND_EXAMPLE.tsx) - Ejemplo completo con React + Chart.js
- [.github/copilot-instructions.md](.github/copilot-instructions.md) - Guía de arquitectura del proyecto

---

## ⚡ Próximos Pasos

1. **Probar los endpoints** con Postman/Thunder Client
2. **Integrar en el frontend** usando el ejemplo proporcionado
3. **Agregar caché** (opcional) para optimizar rendimiento
4. **Personalizar gráficos** según diseño del dashboard

---

## 🧪 Testing

### Con cURL

```bash
# Todas las métricas
curl http://localhost:3000/api/v1/invoice/dashboard/all-metrics

# Métricas diarias
curl http://localhost:3000/api/v1/invoice/dashboard/daily-metrics

# Métricas mensuales
curl http://localhost:3000/api/v1/invoice/dashboard/monthly-metrics
```

### Con Postman

Importa la colección desde:

```
GET http://localhost:3000/api/v1/invoice/dashboard/all-metrics
```

---

## 📝 Notas Importantes

1. **IVA**: Se calcula al 19% (`total / 1.19`)
2. **Timezone**: Fechas en hora local del servidor
3. **Rendimiento**: `/all-metrics` ejecuta 5 consultas en paralelo
4. **Formato de fechas**: Días en formato `"DD-MM"` (ej: `"9-12"`)
5. **Métodos de pago**:
   - `"efectivo"` → Efectivo
   - `"pendiente"` → Pendiente
   - ID numérico → Nombre del banco

---

## 👨‍💻 Soporte

Para dudas o problemas, revisar:

- [DASHBOARD_API.md](DASHBOARD_API.md) - Documentación completa
- [FRONTEND_EXAMPLE.tsx](FRONTEND_EXAMPLE.tsx) - Ejemplos de código
