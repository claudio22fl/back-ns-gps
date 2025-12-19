# 🔄 Migración de Ventas - Sistema Antiguo a Nuevo

## 📋 Descripción

Este sistema permite migrar todas las ventas desde el sistema antiguo (`eberetes.cl`) al nuevo sistema, preservando los IDs originales y creando automáticamente todos los datos necesarios (clientes, empresas, productos, etc.).

## 🎯 Características

- ✅ **Preserva IDs originales** - Permite ejecutar la migración múltiples veces
- ✅ **Auto-creación de datos** - Crea automáticamente clientes, empresas, productos, usuarios y bancos si no existen
- ✅ **Transacciones seguras** - Usa transacciones de base de datos para garantizar consistencia
- ✅ **Procesamiento por lotes** - Procesa en lotes para evitar sobrecarga
- ✅ **Reportes detallados** - Muestra estadísticas completas de la migración
- ✅ **Validación de datos** - Endpoint para validar datos antes de migrar

## 🚀 Métodos de Migración

### Método 1: Script Automatizado (Recomendado)

Este script obtiene automáticamente todas las ventas del sistema antiguo y las migra en lotes.

#### 1. Inicia tu servidor local

```bash
npm run start:dev
```

#### 2. En otra terminal, ejecuta el script de migración

```bash
npm run migrate:sales
```

El script:

- 📡 Consulta automáticamente el API antiguo
- 🔄 Procesa en lotes de 50 ventas
- 📊 Muestra progreso en tiempo real
- ✅ Genera reporte final con estadísticas

**Ejemplo de salida:**

```
╔════════════════════════════════════════════════════════════╗
║          🚀 MIGRACIÓN DE VENTAS - SISTEMA ANTIGUO         ║
╚════════════════════════════════════════════════════════════╝

📊 Información de migración:
   Total de ventas: 53584
   Total de páginas: 5359
   Tamaño de lote: 50 ventas
   Sobrescribir existentes: NO

🔄 Procesando páginas 1 a 5...
📦 Enviando 50 ventas al nuevo sistema...
✅ Lote completado: 45 migradas, 5 omitidas, 0 errores

[...]

╔════════════════════════════════════════════════════════════╗
║                    ✅ MIGRACIÓN COMPLETADA                 ║
╚════════════════════════════════════════════════════════════╝

📊 RESULTADOS:
   ✅ Ventas migradas:     53200
   ⏭️  Ventas omitidas:     384
   ❌ Errores:              0

📈 NUEVOS REGISTROS CREADOS:
   👥 Clientes:            1245
   🏢 Empresas:            387
   📦 Productos:           542
   👤 Usuarios:            12
   🏦 Bancos:              5

⏱️  Tiempo total: 342.56 segundos
```

### Método 2: API Manual

También puedes enviar datos directamente al endpoint de migración.

#### Endpoint: POST `/api/v1/sale-migration`

**Request Body:**

```json
{
  "ventas": [
    {
      "factura": {
        "nofactura": "54621",
        "fecha": "2025-12-18 18:39:46",
        "usuario": "17",
        "codcliente": "1445",
        "codempresa": "3175",
        "totalfactura": "60000",
        "estado": "1",
        "fp": "3",
        "bancos": "[{\"nombre\":\"BancoBCI\",\"valor\":\"60000\"}]",
        "devolucion": "no",
        "direccion": "",
        "Nota": ""
      },
      "cliente": {
        "idcliente": "1445",
        "dni": "26.607.729-7",
        "nombre": "LUIS MUNOZ",
        "telefono": "",
        "direccion": ""
      },
      "empresa": {
        "idcliente": "3175",
        "dni": "78.294.779-6",
        "nombre": "VELTA GROUP SPA",
        "telefono": "",
        "direccion": "si"
      },
      "vendedor": "NOVASATGPS",
      "detalle": [
        {
          "correlativo": "149248",
          "nofactura": "54621",
          "codproducto": "1457",
          "cantidad": "1",
          "fp": "si",
          "precio_venta": "25000",
          "precio_costo": "6500",
          "precioTotal": "25000",
          "producto": {
            "codigo": "PE-012N",
            "descripcion": "BISEL 9 PEUGEOT 012N"
          }
        }
      ]
    }
  ],
  "overwrite": false
}
```

**Response:**

```json
{
  "statusCode": 200,
  "message": "Migración completada: 1 exitosas, 0 omitidas, 0 errores",
  "data": {
    "success": true,
    "totalVentas": 1,
    "ventasMigradas": 1,
    "ventasOmitidas": 0,
    "errores": [],
    "detalles": {
      "clientesCreados": 1,
      "empresasCreadas": 1,
      "productosCreados": 1,
      "usuariosCreados": 0,
      "bancosCreados": 1
    }
  }
}
```

## 🔍 Validación de Datos

Antes de migrar, puedes validar la estructura de los datos:

**Endpoint: POST `/api/v1/sale-migration/validate`**

```bash
curl -X POST http://localhost:3000/api/v1/sale-migration/validate \
  -H "Content-Type: application/json" \
  -d '{"ventas": [...]}'
```

**Response:**

```json
{
  "statusCode": 200,
  "message": "Validación completada: 10 válidas, 0 inválidas",
  "data": {
    "totalVentas": 10,
    "ventasValidas": 10,
    "ventasInvalidas": 0,
    "errores": []
  }
}
```

## ⚙️ Configuración del Script

Puedes modificar las constantes en `src/scripts/migrate-all-sales.js`:

```javascript
const OLD_API_URL = 'https://eberetes.cl/api/getVentasCompletas.php';
const NEW_API_URL = 'http://localhost:3000/api/v1/sale-migration';
const BATCH_SIZE = 50; // Ventas por lote
const START_PAGE = 1; // Página inicial
const OVERWRITE = false; // true = sobrescribe ventas existentes
```

## 📊 Mapeo de Datos

### Sistema Antiguo → Sistema Nuevo

| Campo Antiguo          | Campo Nuevo         | Transformación       |
| ---------------------- | ------------------- | -------------------- |
| `factura.nofactura`    | `sale.id`           | Preserva ID original |
| `factura.totalfactura` | `sale.total_amount` | Conversión a decimal |
| `factura.fecha`        | `sale.sale_date`    | Conversión a Date    |
| `cliente.idcliente`    | `client.id`         | Preserva ID original |
| `empresa.idcliente`    | `company.id`        | Preserva ID original |
| `detalle.codproducto`  | `product.id`        | Preserva ID original |
| `factura.usuario`      | `user.id`           | Preserva ID original |

### Auto-creación de Registros

Si un registro no existe, se crea automáticamente:

- **Cliente**: Usa datos del sistema antiguo
- **Empresa**: Usa datos del sistema antiguo (si tiene nombre válido)
- **Producto**: Usa código y descripción del sistema antiguo, stock en 0
- **Usuario**: Crea con username del vendedor, password temporal
- **Banco**: Extrae del campo `bancos` JSON

## 🔄 Re-ejecución Segura

El sistema está diseñado para ejecutarse múltiples veces:

### Modo Normal (`overwrite: false`)

- ✅ Omite ventas que ya existen
- ✅ Solo crea registros nuevos
- ✅ No modifica datos existentes

### Modo Sobrescritura (`overwrite: true`)

- ⚠️ Actualiza ventas existentes
- ⚠️ Reemplaza productos de la venta
- ✅ Útil para corregir datos

## 🐛 Manejo de Errores

El sistema maneja varios casos:

1. **Ventas sin factura**: Se omiten automáticamente
2. **Empresas sin nombre**: Se asigna `null`
3. **Bancos en JSON inválido**: Continúa sin bancos
4. **Errores individuales**: Se registran pero no detienen la migración
5. **Errores de transacción**: Hace rollback completo de la venta

## 📝 Logs y Debugging

Durante la migración verás logs detallados:

- 📡 `Obteniendo página X...` - Consultando API antiguo
- 📦 `Enviando X ventas...` - Enviando al nuevo sistema
- ✅ `Venta X migrada exitosamente` - Venta procesada
- ⏭️ `Venta X ya existe, omitiendo` - Venta duplicada
- ❌ `Error en venta X` - Error específico
- 👥 `Cliente creado` - Nuevo cliente
- 🏢 `Empresa creada` - Nueva empresa
- etc.

## 🎯 Casos de Uso

### 1. Primera Migración Completa

```bash
# Configurar OVERWRITE = false
npm run migrate:sales
```

### 2. Actualizar Ventas Específicas

```bash
# Configurar OVERWRITE = true
# Modificar START_PAGE y crear lógica de filtrado
npm run migrate:sales
```

### 3. Migración Parcial para Pruebas

```javascript
// En migrate-all-sales.js
const START_PAGE = 1;
// Y agregar condición de parada temprana
if (currentPage > 10) break; // Solo primeras 10 páginas
```

### 4. Validar Antes de Migrar

```bash
curl -X POST http://localhost:3000/api/v1/sale-migration/validate \
  -H "Content-Type: application/json" \
  -d @ventas-sample.json
```

## ⚠️ Consideraciones Importantes

1. **Base de Datos**: Asegúrate de tener backup antes de migrar
2. **IDs**: Los IDs originales se preservan, puede haber gaps
3. **Categorías**: Los productos nuevos usan categoría ID 1 (debe existir)
4. **Passwords**: Usuarios creados tienen password temporal "MIGRATED_USER"
5. **Stock**: Productos importados tienen stock en 0
6. **Tiempo**: ~53,000 ventas toman ~5-10 minutos

## 🔧 Troubleshooting

### Error: "Cannot connect to database"

- Verifica que tu servidor esté corriendo
- Revisa credenciales de base de datos en `.env`

### Error: "Category ID 1 does not exist"

- Crea una categoría con ID 1 en tu base de datos

### Ventas omitidas masivamente

- Verifica que `OVERWRITE = false` si ya ejecutaste la migración
- Revisa logs para ver el motivo específico

### Script se detiene

- Verifica conexión a internet (para API antiguo)
- Verifica que el servidor local esté respondiendo
- Aumenta timeout si es necesario

## 📞 Soporte

Si encuentras problemas durante la migración, revisa:

1. Logs del servidor (`npm run start:dev`)
2. Logs del script de migración
3. Campo `errores` en la respuesta del API
