# Backend API - Guía para Agentes AI

## Arquitectura del Proyecto

Este es un backend API REST para gestión de ventas construido con **Express + TypeScript + Sequelize + MySQL**. La arquitectura sigue el patrón MVC con separación clara de responsabilidades:

- **Controllers**: Manejan HTTP requests/responses usando `customResponse()`
- **Services**: Lógica de negocio y operaciones de base de datos
- **Models**: Definiciones Sequelize con soft deletes habilitado (`paranoid: true`)
- **Routes**: Auto-discovery dinámico desde archivos en `/routes/`

## Patrones de Desarrollo Específicos

### Sistema de Routing Automático

Las rutas se cargan dinámicamente desde `src/routes/index.ts`. Para agregar nuevas rutas:

1. Crear archivo en `/routes/` (ej: `product.ts`)
2. Exportar `router` - se montará automáticamente en `/${filename}`

### Respuestas Estandarizadas

**SIEMPRE** usar `customResponse()` para respuestas HTTP:

```typescript
customResponse({
  res,
  statusCode: 200,
  data: product,
  message: 'Producto encontrado',
  pagination: pagination, // opcional
});
```

### Sistema de Cache Inteligente

Usar `safeCache()` para operaciones costosas:

```typescript
import { safeCache } from '../utils/safeCache';
import { cacheKeys } from '../utils/cacheKeys';

const data = await safeCache(cacheKeys.products, fetchFunction, ttlMinutes);
```

### Filtrado Dinámico Universal

Usar `generateWhereClause()` para búsquedas en cualquier modelo:

```typescript
const whereClause = generateWhereClause(Product, filterValue);
const products = await Product.findAndCountAll({ where: whereClause });
```

### Modelo de Base de Datos

- **Soft Deletes**: Todos los modelos usan `paranoid: true`
- **Timestamps**: `created_at`, `updated_at`, `deleted_at`
- **Relaciones**: Definidas en `src/models/index.ts` (ej: Client ↔ Company many-to-many)

### ⚠️ Estado Actual de Entidades (DB vs Código)

#### Modelos Implementados:

- ✅ `Category` - Completo
- ✅ `Product` - Completo
- ❌ `Client` - **Faltan campos**: `address`, `email`, `city`
- ❌ `Company` - **Faltan campos**: `address`, `email` + interfaz incorrecta
- ❌ `User` - **Falta campo**: `state`
- ⚠️ `ClientCompany` - Tabla real: `company-client`

#### Entidades Faltantes (solo en DB):

`accessory`, `bank`, `city`, `department`, `device`, `device_assigned`, `inventory`, `invoice`, `location`, `payment`, `sale`, `simulation`, `type_payment`, `type_user`

#### Al crear nuevos modelos:

1. Verificar estructura real en DB antes de implementar
2. Usar nombres de tabla exactos del esquema DB
3. Incluir TODOS los campos de la tabla correspondiente

## Comandos de Desarrollo

```bash
npm run dev        # Desarrollo con hot-reload
npm run build      # Compilar TypeScript
npm run start      # Producción (requiere build)
npm run start:dev  # Desarrollo directo con ts-node
```

## Variables de Entorno Requeridas

```env
PORT=3000
ROUTE=api/v1
DB_HOST=localhost
DB_NAME=nsgps
DB_USER=root
DB_PASSWORD=123456
```

## Convenciones de Código

### Controladores

- Usar destructuring para `body` y `params`
- Manejar errores con `handleHttp()`
- Validar existencia antes de operaciones

### Servicios

- Retornar objetos con `data` y `pagination` para listas
- Usar tipos TypeScript específicos de interfaces
- Implementar paginación con `offset/limit`

### Modelos Sequelize

- Extender `Model<Attributes, CreationAttributes>`
- Usar `DataTypes` específicos con validaciones
- Configurar `tableName` explícitamente
- Habilitar `timestamps` y `paranoid`

## Estructura de Carpetas Crítica

```
src/
├── config/db.ts           # Configuración Sequelize + MySQL pool
├── controllers/           # Lógica HTTP request/response
├── services/             # Lógica de negocio y DB operations
├── models/               # Definiciones Sequelize + relaciones
├── routes/               # Auto-discovery routing
├── interfaces/           # TypeScript type definitions
└── utils/                # Cache, responses, filters, error handling
```

## Debugging y Logs

- Cache hits/misses se loggean automáticamente con emojis (`📦 [CACHE HIT]`)
- Conexión DB usa símbolos visuales (`✅ Conexión establecida`)
- Errores se manejan centralizadamente con `handleHttp()`
