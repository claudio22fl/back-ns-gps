/**
 * Script auxiliar para migrar ventas desde el servidor antiguo
 *
 * Uso:
 * 1. Asegúrate de tener el servidor corriendo: npm run dev
 * 2. Ejecuta: npm run migrate-sales
 *
 * Este script:
 * - Consulta el endpoint antiguo página por página
 * - Envía los datos al nuevo endpoint de migración
 * - Muestra progreso y estadísticas
 */

const OLD_API_URL = 'https://eberetes.cl/api/getVentasCompletas.php';
const NEW_API_URL = 'http://localhost:3000/api/v1/migration/sales';
const LIMIT_PER_PAGE = 100; // Ajusta según capacidad del servidor

interface FetchOptions {
  startPage?: number;
  endPage?: number;
  totalPages?: number;
}

async function fetchOldSalesPage(page: number, limit: number = LIMIT_PER_PAGE) {
  try {
    const response = await fetch(`${OLD_API_URL}?page=${page}&limit=${limit}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error(`❌ Error fetching page ${page}:`, error.message);
    throw error;
  }
}

async function migrateToNewSystem(salesData: any[]) {
  try {
    const response = await fetch(NEW_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: salesData }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('❌ Error migrating to new system:', error.message);
    throw error;
  }
}

async function migrateSales(options: FetchOptions = {}) {
  console.log('🚀 Iniciando migración de ventas...\n');

  let currentPage = options.startPage || 1;
  let totalPages = options.totalPages || Infinity;
  const endPage = options.endPage || Infinity;

  const globalStats = {
    pagesProcessed: 0,
    totalCreated: 0,
    totalUpdated: 0,
    totalSkipped: 0,
    totalErrors: 0,
    totalSales: 0,
  };

  try {
    while (currentPage <= Math.min(totalPages, endPage)) {
      console.log(`\n📄 Procesando página ${currentPage}/${totalPages}...`);

      // Obtener datos del sistema antiguo
      const oldData = await fetchOldSalesPage(currentPage, LIMIT_PER_PAGE);

      if (!oldData.success || !oldData.data) {
        console.log(`⚠️  Página ${currentPage} sin datos, finalizando...`);
        break;
      }

      // Actualizar total de páginas si viene en la respuesta
      if (oldData.pagination && oldData.pagination.totalPages) {
        totalPages = parseInt(oldData.pagination.totalPages);
      }

      // Filtrar ventas vacías
      const validSales = oldData.data.filter((sale: any) => sale.factura && sale.factura.nofactura);

      if (validSales.length === 0) {
        console.log(`⚠️  No hay ventas válidas en página ${currentPage}`);
        currentPage++;
        continue;
      }

      console.log(`   📦 ${validSales.length} ventas válidas encontradas`);

      // Migrar al nuevo sistema
      const result = await migrateToNewSystem(validSales);

      // Actualizar estadísticas
      globalStats.pagesProcessed++;
      globalStats.totalCreated += result.data.stats.created;
      globalStats.totalUpdated += result.data.stats.updated;
      globalStats.totalSkipped += result.data.stats.skipped;
      globalStats.totalErrors += result.data.stats.errors;
      globalStats.totalSales += validSales.length;

      console.log(`   ✅ Creadas: ${result.data.stats.created}`);
      console.log(`   🔄 Actualizadas: ${result.data.stats.updated}`);
      console.log(`   ⏭️  Omitidas: ${result.data.stats.skipped}`);
      console.log(`   ❌ Errores: ${result.data.stats.errors}`);

      if (result.data.errors && result.data.errors.length > 0) {
        console.log('\n   ⚠️  Errores detallados:');
        result.data.errors.slice(0, 5).forEach((err: any) => {
          console.log(`      - Factura ${err.invoice}: ${err.error}`);
        });
        if (result.data.errors.length > 5) {
          console.log(`      ... y ${result.data.errors.length - 5} errores más`);
        }
      }

      // Pausa pequeña para no sobrecargar el servidor
      await new Promise((resolve) => setTimeout(resolve, 1000));

      currentPage++;
    }

    // Resumen final
    console.log('\n' + '='.repeat(60));
    console.log('🎉 MIGRACIÓN COMPLETADA');
    console.log('='.repeat(60));
    console.log(`📊 Estadísticas finales:`);
    console.log(`   - Páginas procesadas: ${globalStats.pagesProcessed}`);
    console.log(`   - Total ventas procesadas: ${globalStats.totalSales}`);
    console.log(`   - ✅ Creadas: ${globalStats.totalCreated}`);
    console.log(`   - 🔄 Actualizadas: ${globalStats.totalUpdated}`);
    console.log(`   - ⏭️  Omitidas: ${globalStats.totalSkipped}`);
    console.log(`   - ❌ Errores: ${globalStats.totalErrors}`);
    console.log('='.repeat(60) + '\n');
  } catch (error: any) {
    console.error('\n💥 Error fatal en la migración:', error.message);
    console.log('\n📊 Estadísticas parciales:');
    console.log(`   - Páginas procesadas: ${globalStats.pagesProcessed}`);
    console.log(`   - Total ventas procesadas: ${globalStats.totalSales}`);
    console.log(`   - ✅ Creadas: ${globalStats.totalCreated}`);
    console.log(`   - 🔄 Actualizadas: ${globalStats.totalUpdated}`);
    process.exit(1);
  }
}

// Ejemplos de uso:

// 1. Migrar todas las páginas (cuidado, puede ser mucho!)
// migrateSales();

// 2. Migrar solo las primeras 10 páginas (RECOMENDADO PARA PRUEBAS)
migrateSales({ startPage: 1, endPage: 10 });

// 3. Migrar desde la página 50 hasta la 100
// migrateSales({ startPage: 50, endPage: 100 });

// 4. Migrar una sola página específica
// migrateSales({ startPage: 1, endPage: 1 });

export { migrateSales };
