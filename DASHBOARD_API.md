# API Endpoints - Dashboard de Ventas

Documentación de los endpoints para obtener métricas del dashboard de ventas.

## Base URL

```
http://localhost:3000/api/v1/invoice
```

---

## 📊 Endpoint Recomendado (Todo en uno)

### GET `/dashboard/all-metrics`

Obtiene todas las métricas del dashboard en una sola llamada (optimizado).

**Response:**

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
      {
        "date": "1-12",
        "ventasBrutas": 8156500,
        "ventasNetas": 2392650
      },
      {
        "date": "2-12",
        "ventasBrutas": 10234000,
        "ventasNetas": 3001234
      }
      // ... más días
    ],
    "dailyPaymentChart": [
      {
        "date": "1-12",
        "payments": {
          "Transferencias": 8156500,
          "BancoChile": 2243400,
          "Bancoltau": 368300,
          "BancoScoe": 874000,
          "BancoBCI": 3020100,
          "Otros": 1650700,
          "Pendiente": 0,
          "Efectivo": 0
        }
      }
      // ... más días
    ],
    "monthlySalesChart": [
      {
        "month": "Enero",
        "year": 2024,
        "currentYear": 500000000,
        "lastYear": 450000000
      }
      // ... más meses
    ]
  }
}
```

---

## 📈 Endpoints Individuales

### 1. GET `/dashboard/daily-metrics`

Obtiene métricas del día actual.

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Métricas diarias obtenidas exitosamente",
  "data": {
    "totalBrutoHoy": 2180550,
    "totalNetoHoy": 802290,
    "cambioPercentBruto": -50.71,
    "cambioPercentNeto": -50.71,
    "pagoTransferencia": 1699950,
    "pagoEfectivo": 530600
  }
}
```

**Uso en Frontend:**

```typescript
// Tarjetas superiores del dashboard
const dailyMetrics = data.totalBrutoHoy;
const comparison = data.cambioPercentBruto;
const transferPayments = data.pagoTransferencia;
const cashPayments = data.pagoEfectivo;
```

---

### 2. GET `/dashboard/monthly-metrics`

Obtiene métricas del mes actual.

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Métricas mensuales obtenidas exitosamente",
  "data": {
    "ventaBrutaMensual": 90012792,
    "ventaNetaMensual": 31382822,
    "totalIvaMes": 4991944,
    "totalMes": 90012792,
    "cambioPercentBruto": -18.46,
    "cambioPercentNeto": -18.46
  }
}
```

**Uso en Frontend:**

```typescript
// Tarjetas de métricas mensuales
const monthlyGross = data.ventaBrutaMensual;
const monthlyNet = data.ventaNetaMensual;
const monthlyIva = data.totalIvaMes;
const monthComparison = data.cambioPercentBruto;
```

---

### 3. GET `/dashboard/daily-sales`

Obtiene ventas diarias del mes actual (para gráfico de barras simple).

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Ventas diarias obtenidas exitosamente",
  "data": [
    {
      "date": "1-12",
      "ventasBrutas": 8156500,
      "ventasNetas": 2392650
    },
    {
      "date": "2-12",
      "ventasBrutas": 10234000,
      "ventasNetas": 3001234
    },
    {
      "date": "9-12",
      "ventasBrutas": 8126500,
      "ventasNetas": 2392650
    }
  ]
}
```

**Uso en Frontend (Chart.js / Recharts):**

```typescript
// Gráfico de barras "Ventas Diarias"
const labels = data.map((d) => d.date);
const brutasData = data.map((d) => d.ventasBrutas);
const netasData = data.map((d) => d.ventasNetas);
```

---

### 4. GET `/dashboard/daily-sales-by-payment`

Obtiene ventas diarias con desglose por método de pago (para gráfico de barras apiladas).

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Ventas por método de pago obtenidas exitosamente",
  "data": [
    {
      "date": "9-12",
      "payments": {
        "Transferencias": 8156500,
        "BancoChile": 2243400,
        "Bancoltau": 368300,
        "BancoScoe": 874000,
        "BancoBCI": 3020100,
        "Otros": 1650700,
        "Pendiente": 0,
        "Efectivo": 0
      }
    },
    {
      "date": "10-12",
      "payments": {
        "BancoChile": 1500000,
        "Efectivo": 500000
      }
    }
  ]
}
```

**Uso en Frontend (Chart.js Stacked Bar):**

```typescript
// Gráfico de barras apiladas por método de pago
const labels = data.map((d) => d.date);
const datasets = [
  {
    label: 'Transferencias',
    data: data.map((d) => d.payments.Transferencias || 0),
  },
  {
    label: 'BancoChile',
    data: data.map((d) => d.payments.BancoChile || 0),
  },
  // ... otros métodos
];
```

---

### 5. GET `/dashboard/monthly-sales-comparison`

Obtiene comparación de ventas mensuales (últimos 12 meses vs año anterior).

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Comparación mensual obtenida exitosamente",
  "data": [
    {
      "month": "Diciembre",
      "year": 2023,
      "currentYear": 450000000,
      "lastYear": 420000000
    },
    {
      "month": "Enero",
      "year": 2024,
      "currentYear": 500000000,
      "lastYear": 450000000
    },
    {
      "month": "Febrero",
      "year": 2024,
      "currentYear": 480000000,
      "lastYear": 460000000
    }
    // ... 12 meses
  ]
}
```

**Uso en Frontend (Chart.js Line):**

```typescript
// Gráfico de líneas "Ventas Mensuales" comparativo
const labels = data.map((d) => d.month);
const currentYearData = data.map((d) => d.currentYear);
const lastYearData = data.map((d) => d.lastYear);

// Calcular porcentaje de crecimiento general
const totalCurrent = currentYearData.reduce((a, b) => a + b, 0);
const totalLast = lastYearData.reduce((a, b) => a + b, 0);
const growthPercent = ((totalCurrent - totalLast) / totalLast) * 100;
```

---

## 🎯 Ejemplo de Uso en React/Vue

### Opción 1: Una sola llamada (Recomendado)

```typescript
async function loadDashboardData() {
  const response = await fetch('http://localhost:3000/api/v1/invoice/dashboard/all-metrics');
  const result = await response.json();

  if (result.success) {
    // Tarjetas superiores
    setDailyMetrics(result.data.daily);
    setMonthlyMetrics(result.data.monthly);

    // Gráficos
    setDailySalesChart(result.data.dailySalesChart);
    setPaymentMethodChart(result.data.dailyPaymentChart);
    setMonthlySalesChart(result.data.monthlySalesChart);
  }
}
```

### Opción 2: Llamadas individuales

```typescript
async function loadDashboard() {
  const [daily, monthly, dailySales, paymentSales, monthlySales] = await Promise.all([
    fetch('/api/v1/invoice/dashboard/daily-metrics').then((r) => r.json()),
    fetch('/api/v1/invoice/dashboard/monthly-metrics').then((r) => r.json()),
    fetch('/api/v1/invoice/dashboard/daily-sales').then((r) => r.json()),
    fetch('/api/v1/invoice/dashboard/daily-sales-by-payment').then((r) => r.json()),
    fetch('/api/v1/invoice/dashboard/monthly-sales-comparison').then((r) => r.json()),
  ]);
}
```

---

## 📋 Notas Técnicas

1. **Cálculo de IVA**: Se asume 19% (total / 1.19 para obtener neto)
2. **Fechas**: Usa `invoice.date` para agrupar por día/mes
3. **Exclusiones**: Las devoluciones (`is_return = true`) NO se incluyen
4. **Métodos de pago**:
   - `"efectivo"` → Efectivo
   - `"pendiente"` → Pendiente
   - ID numérico → Se mapea a banco específico
5. **Timezone**: Las fechas se calculan en hora local del servidor

---

## 🔧 Optimizaciones Futuras

- [ ] Agregar caché con TTL de 5 minutos para métricas
- [ ] Agregar filtros por rango de fechas personalizados
- [ ] Agregar métricas por vendedor
- [ ] Agregar métricas por producto más vendido
