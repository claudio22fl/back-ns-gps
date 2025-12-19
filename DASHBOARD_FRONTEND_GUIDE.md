# 📊 Dashboard de Ventas - Guía para Frontend

## 🎯 Endpoint Principal (Recomendado)

```
GET http://localhost:3000/api/v1/invoice/dashboard/all-metrics
```

**Este endpoint devuelve TODAS las métricas del dashboard en una sola llamada.**

---

## 📦 Estructura de la Respuesta

```typescript
{
  "success": true,
  "statusCode": 200,
  "message": "Métricas del dashboard obtenidas exitosamente",
  "data": {
    // MÉTRICAS DEL DÍA ACTUAL
    "daily": {
      "totalBrutoHoy": 2180550,           // Total ventas brutas de hoy
      "totalNetoHoy": 802290,              // Total ventas netas de hoy (sin IVA)
      "cambioPercentBruto": -50.71,        // % de cambio vs ayer
      "cambioPercentNeto": -50.71,         // % de cambio vs ayer
      "pagoTransferencia": 1699950,        // Total pagos por transferencia hoy
      "pagoEfectivo": 530600               // Total pagos en efectivo hoy
    },

    // MÉTRICAS DEL MES ACTUAL
    "monthly": {
      "ventaBrutaMensual": 90012792,       // Total ventas brutas del mes
      "ventaNetaMensual": 31382822,        // Total ventas netas del mes
      "totalIvaMes": 4991944,              // Total IVA del mes
      "totalMes": 26390878,                // Total del mes
      "cambioPercentBruto": -18.46,        // % de cambio vs mes anterior
      "cambioPercentNeto": -18.46          // % de cambio vs mes anterior
    },

    // DATOS PARA GRÁFICO: VENTAS DIARIAS DEL MES
    "dailySalesChart": [
      {
        "date": "1-12",                    // Día-Mes
        "ventasBrutas": 8156500,
        "ventasNetas": 2392650
      },
      {
        "date": "2-12",
        "ventasBrutas": 10234000,
        "ventasNetas": 3001234
      }
      // ... un objeto por cada día del mes que tiene ventas
    ],

    // DATOS PARA GRÁFICO: VENTAS POR MÉTODO DE PAGO
    "dailyPaymentChart": [
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
      }
      // ... un objeto por cada día con pagos
    ],

    // DATOS PARA GRÁFICO: COMPARACIÓN MENSUAL (12 MESES)
    "monthlySalesChart": [
      {
        "month": "Diciembre",              // Nombre del mes
        "year": 2024,                      // Año
        "currentYear": 500000000,          // Ventas de este año
        "lastYear": 450000000              // Ventas del año pasado (mismo mes)
      }
      // ... 12 objetos (últimos 12 meses)
    ]
  }
}
```

---

## 💻 Código de Ejemplo (React/TypeScript)

```typescript
// 1. Definir las interfaces
interface DashboardMetrics {
  daily: {
    totalBrutoHoy: number;
    totalNetoHoy: number;
    cambioPercentBruto: number;
    cambioPercentNeto: number;
    pagoTransferencia: number;
    pagoEfectivo: number;
  };
  monthly: {
    ventaBrutaMensual: number;
    ventaNetaMensual: number;
    totalIvaMes: number;
    totalMes: number;
    cambioPercentBruto: number;
    cambioPercentNeto: number;
  };
  dailySalesChart: Array<{
    date: string;
    ventasBrutas: number;
    ventasNetas: number;
  }>;
  dailyPaymentChart: Array<{
    date: string;
    payments: { [key: string]: number };
  }>;
  monthlySalesChart: Array<{
    month: string;
    year: number;
    currentYear: number;
    lastYear: number;
  }>;
}

// 2. Función para obtener los datos
async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const response = await fetch(
    'http://localhost:3000/api/v1/invoice/dashboard/all-metrics'
  );
  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message);
  }

  return result.data;
}

// 3. Usar en tu componente
function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardMetrics()
      .then(data => {
        setMetrics(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Cargando...</div>;
  if (!metrics) return <div>Error al cargar datos</div>;

  return (
    <div>
      {/* TARJETAS SUPERIORES */}
      <h2>Total Bruto Hoy: ${metrics.daily.totalBrutoHoy.toLocaleString()}</h2>
      <p>Cambio: {metrics.daily.cambioPercentBruto}% desde ayer</p>

      <h2>Venta Bruta Mensual: ${metrics.monthly.ventaBrutaMensual.toLocaleString()}</h2>

      {/* GRÁFICOS */}
      <Chart data={metrics.dailySalesChart} />
      <PaymentChart data={metrics.dailyPaymentChart} />
      <MonthlyChart data={metrics.monthlySalesChart} />
    </div>
  );
}
```

---

## 📊 Mapeo de Datos a Componentes UI

| Componente UI                         | Datos a Usar                                              |
| ------------------------------------- | --------------------------------------------------------- |
| **Tarjeta "TOTAL BRUTO HOY"**         | `data.daily.totalBrutoHoy`                                |
| **Texto comparación día**             | `data.daily.cambioPercentBruto + "% desde ayer"`          |
| **Tarjeta "TOTAL NETO HOY"**          | `data.daily.totalNetoHoy`                                 |
| **Tarjeta "VENTA BRUTA MENSUAL"**     | `data.monthly.ventaBrutaMensual`                          |
| **Texto comparación mes**             | `data.monthly.cambioPercentBruto + "% que el mes pasado"` |
| **Tarjeta "VENTA NETA MENSUAL"**      | `data.monthly.ventaNetaMensual`                           |
| **Tarjeta "PAGO TRANSFERENCIA"**      | `data.daily.pagoTransferencia`                            |
| **Tarjeta "PAGO EFECTIVO"**           | `data.daily.pagoEfectivo`                                 |
| **Tarjeta "TOTAL IVA MES"**           | `data.monthly.totalIvaMes`                                |
| **Tarjeta "TOTAL MES"**               | `data.monthly.totalMes`                                   |
| **Gráfico Barras (Ventas Diarias)**   | `data.dailySalesChart`                                    |
| **Gráfico Barras Apiladas (Pagos)**   | `data.dailyPaymentChart`                                  |
| **Gráfico Líneas (Ventas Mensuales)** | `data.monthlySalesChart`                                  |

---

## 🎨 Ejemplo para Chart.js (Ventas Diarias)

```typescript
// Configuración para gráfico de barras
const chartData = {
  labels: metrics.dailySalesChart.map((d) => d.date), // ["1-12", "2-12", ...]
  datasets: [
    {
      label: 'Ventas Brutas',
      data: metrics.dailySalesChart.map((d) => d.ventasBrutas),
      backgroundColor: 'rgba(99, 102, 241, 0.6)',
    },
    {
      label: 'Ventas Netas',
      data: metrics.dailySalesChart.map((d) => d.ventasNetas),
      backgroundColor: 'rgba(34, 197, 94, 0.6)',
    },
  ],
};
```

---

## 🎨 Ejemplo para Chart.js (Pagos por Método)

```typescript
// Obtener todos los métodos de pago únicos
const paymentMethods = Array.from(
  new Set(metrics.dailyPaymentChart.flatMap((d) => Object.keys(d.payments)))
);

const chartData = {
  labels: metrics.dailyPaymentChart.map((d) => d.date),
  datasets: paymentMethods.map((method) => ({
    label: method,
    data: metrics.dailyPaymentChart.map((d) => d.payments[method] || 0),
    backgroundColor: getColorForMethod(method), // Tu función de colores
  })),
};

// Opciones para barras apiladas
const options = {
  scales: {
    x: { stacked: true },
    y: { stacked: true },
  },
};
```

---

## 🎨 Ejemplo para Chart.js (Comparación Mensual)

```typescript
const chartData = {
  labels: metrics.monthlySalesChart.map((d) => d.month),
  datasets: [
    {
      label: '2024 (Año actual)',
      data: metrics.monthlySalesChart.map((d) => d.currentYear),
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.4,
    },
    {
      label: '2023 (Año anterior)',
      data: metrics.monthlySalesChart.map((d) => d.lastYear),
      borderColor: 'rgb(54, 162, 235)',
      tension: 0.4,
    },
  ],
};
```

---

## ⚡ Endpoints Alternativos (Individuales)

Si solo necesitas actualizar una métrica específica:

```
GET /api/v1/invoice/dashboard/daily-metrics          → Solo métricas del día
GET /api/v1/invoice/dashboard/monthly-metrics        → Solo métricas del mes
GET /api/v1/invoice/dashboard/daily-sales            → Solo ventas diarias
GET /api/v1/invoice/dashboard/daily-sales-by-payment → Solo pagos por método
GET /api/v1/invoice/dashboard/monthly-sales-comparison → Solo comparación mensual
```

**Pero es más eficiente usar `/all-metrics` que trae todo.**

---

## 📝 Notas Importantes

1. **Formato de moneda**: Los valores son números enteros (pesos chilenos)
2. **Porcentajes**: Pueden ser negativos (baja en ventas) o positivos (aumento)
3. **Fechas**: Formato `"DD-MM"` para días (ej: `"9-12"`)
4. **IVA**: Ya viene calculado al 19% (no necesitas calcularlo)
5. **Actualización**: Llama al endpoint cada vez que cargues el dashboard

---

## ❓ FAQ

**¿Con qué frecuencia actualizo los datos?**

- Al cargar la página
- Opcionalmente cada 5-10 minutos con `setInterval`

**¿Necesito pasar parámetros?**

- No, el endpoint devuelve datos del día/mes actual automáticamente

**¿Cómo muestro el cambio porcentual?**

```typescript
const color = metrics.daily.cambioPercentBruto >= 0 ? 'green' : 'red';
const icon = metrics.daily.cambioPercentBruto >= 0 ? '↑' : '↓';
```

**¿Qué pasa si no hay datos?**

- Los arrays vendrán vacíos `[]`
- Los totales serán `0`

---

## 🚀 Checklist de Implementación

- [ ] Crear servicio/hook para llamar al endpoint
- [ ] Crear interfaces TypeScript según la estructura
- [ ] Implementar tarjetas de métricas superiores
- [ ] Implementar gráfico de ventas diarias (barras)
- [ ] Implementar gráfico de ventas por pago (barras apiladas)
- [ ] Implementar gráfico de comparación mensual (líneas)
- [ ] Agregar loading states
- [ ] Agregar manejo de errores
- [ ] Formatear números como moneda chilena
- [ ] Agregar colores para cambios positivos/negativos

---

**¿Dudas?** Revisa el archivo `FRONTEND_EXAMPLE.tsx` para ver un componente React completo.
