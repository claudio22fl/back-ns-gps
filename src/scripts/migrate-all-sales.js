/**
 * Script para migrar ventas desde el sistema antiguo
 * 
 * Uso:
 * node src/scripts/migrate-all-sales.js
 * 
 * O con npm:
 * npm run migrate:sales
 */

const https = require('https');
const http = require('http');

// Deshabilitar verificación SSL solo para migración
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Configuración
const OLD_API_URL = 'https://eberetes.cl/api/getVentasCompletas.php';
const NEW_API_URL = 'http://localhost:4000/manage/sale-migration';
const BATCH_SIZE = 50; // Procesa 50 ventas por lote para no sobrecargar
const START_PAGE = 1;
const OVERWRITE = false; // Cambiar a true si quieres sobrescribir ventas existentes

// Estadísticas globales
const stats = {
  totalPaginas: 0,
  totalVentas: 0,
  ventasMigradas: 0,
  ventasOmitidas: 0,
  errores: 0,
  clientesCreados: 0,
  empresasCreadas: 0,
  productosCreados: 0,
  usuariosCreados: 0,
  bancosCreados: 0,
  tiempoInicio: Date.now(),
};

/**
 * Obtiene ventas del API antiguo
 */
async function fetchOldSales(page, limit) {
  return new Promise((resolve, reject) => {
    const url = `${OLD_API_URL}?page=${page}&limit=${limit}`;
    
    console.log(`📡 Obteniendo página ${page}...`);
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (error) {
          reject(new Error(`Error parseando JSON: ${error.message}`));
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Envía ventas al nuevo API
 */
async function sendToNewAPI(ventas) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      ventas,
      overwrite: OVERWRITE,
    });

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const url = new URL(NEW_API_URL);
    options.hostname = url.hostname;
    options.port = url.port;
    options.path = url.pathname;

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        // Verificar código de respuesta
        if (res.statusCode !== 200 && res.statusCode !== 207) {
          console.error(`❌ Código de estado HTTP: ${res.statusCode}`);
          console.error(`❌ Respuesta del servidor: ${data.substring(0, 500)}`);
          reject(new Error(`HTTP ${res.statusCode}: ${data.substring(0, 100)}`));
          return;
        }

        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (error) {
          console.error('❌ Respuesta no JSON del servidor:');
          console.error(data.substring(0, 500));
          reject(new Error(`Error parseando respuesta: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Procesa un lote de páginas
 */
async function processBatch(startPage, endPage) {
  console.log(`\n🔄 Procesando páginas ${startPage} a ${endPage}...`);
  
  let allVentas = [];

  // Recolectar ventas de todas las páginas del lote
  for (let page = startPage; page <= endPage; page++) {
    try {
      const response = await fetchOldSales(page, 10);
      
      if (!response.success || !response.data) {
        console.error(`❌ Error en página ${page}: respuesta inválida`);
        continue;
      }

      // Actualizar estadísticas en la primera página
      if (page === START_PAGE && response.pagination) {
        stats.totalPaginas = parseInt(response.pagination.totalPages);
        stats.totalVentas = parseInt(response.pagination.totalVentas);
        console.log(`📊 Total de ventas a migrar: ${stats.totalVentas} (${stats.totalPaginas} páginas)`);
      }

      allVentas = allVentas.concat(response.data);
      
    } catch (error) {
      console.error(`❌ Error obteniendo página ${page}:`, error.message);
    }
  }

  // Filtrar ventas vacías
  allVentas = allVentas.filter(v => v.factura && v.factura.nofactura);

  if (allVentas.length === 0) {
    console.log('⚠️  No hay ventas para procesar en este lote');
    return;
  }

  console.log(`📦 Enviando ${allVentas.length} ventas al nuevo sistema...`);

  try {
    const result = await sendToNewAPI(allVentas);
    
    console.log('📥 Respuesta del servidor:', JSON.stringify(result, null, 2).substring(0, 500));
    
    if (result.data) {
      stats.ventasMigradas += result.data.ventasMigradas || 0;
      stats.ventasOmitidas += result.data.ventasOmitidas || 0;
      stats.errores += result.data.errores?.length || 0;
      
      if (result.data.detalles) {
        stats.clientesCreados += result.data.detalles.clientesCreados || 0;
        stats.empresasCreadas += result.data.detalles.empresasCreadas || 0;
        stats.productosCreados += result.data.detalles.productosCreados || 0;
        stats.usuariosCreados += result.data.detalles.usuariosCreados || 0;
        stats.bancosCreados += result.data.detalles.bancosCreados || 0;
      }

      console.log(`✅ Lote completado: ${result.data.ventasMigradas} migradas, ${result.data.ventasOmitidas} omitidas, ${result.data.errores?.length || 0} errores`);
      
      if (result.data.errores && result.data.errores.length > 0) {
        console.log('⚠️  Errores en este lote:');
        result.data.errores.slice(0, 5).forEach(err => {
          console.log(`   - Factura ${err.nofactura}: ${err.error}`);
        });
        if (result.data.errores.length > 5) {
          console.log(`   ... y ${result.data.errores.length - 5} errores más`);
        }
      }
    } else {
      console.error('⚠️  Respuesta sin campo data:', result);
    }
  } catch (error) {
    console.error('❌ Error enviando lote:', error.message);
    console.error('❌ Stack:', error.stack);
    stats.errores += allVentas.length;
  }
}

/**
 * Función principal
 */
async function main() {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║          🚀 MIGRACIÓN DE VENTAS - SISTEMA ANTIGUO         ║
╚════════════════════════════════════════════════════════════╝
  `);

  try {
    // Obtener primera página para saber cuántas páginas hay
    const firstPage = await fetchOldSales(START_PAGE, 10);
    
    if (!firstPage.success || !firstPage.pagination) {
      throw new Error('No se pudo obtener información de paginación');
    }

    stats.totalPaginas = parseInt(firstPage.pagination.totalPages);
    stats.totalVentas = parseInt(firstPage.pagination.totalVentas);

    console.log(`
📊 Información de migración:
   Total de ventas: ${stats.totalVentas}
   Total de páginas: ${stats.totalPaginas}
   Tamaño de lote: ${BATCH_SIZE} ventas
   Sobrescribir existentes: ${OVERWRITE ? 'SÍ' : 'NO'}
    `);

    // Procesar en lotes
    let currentPage = START_PAGE;
    
    while (currentPage <= stats.totalPaginas) {
      const endPage = Math.min(currentPage + Math.floor(BATCH_SIZE / 10) - 1, stats.totalPaginas);
      
      await processBatch(currentPage, endPage);
      
      currentPage = endPage + 1;
      
      // Pequeña pausa entre lotes para no sobrecargar
      if (currentPage <= stats.totalPaginas) {
        console.log('⏸️  Pausa de 2 segundos...\n');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Resumen final
    const tiempoTotal = ((Date.now() - stats.tiempoInicio) / 1000).toFixed(2);
    
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                    ✅ MIGRACIÓN COMPLETADA                 ║
╚════════════════════════════════════════════════════════════╝

📊 RESULTADOS:
   ✅ Ventas migradas:     ${stats.ventasMigradas}
   ⏭️  Ventas omitidas:     ${stats.ventasOmitidas}
   ❌ Errores:              ${stats.errores}
   
📈 NUEVOS REGISTROS CREADOS:
   👥 Clientes:            ${stats.clientesCreados}
   🏢 Empresas:            ${stats.empresasCreadas}
   📦 Productos:           ${stats.productosCreados}
   👤 Usuarios:            ${stats.usuariosCreados}
   🏦 Bancos:              ${stats.bancosCreados}

⏱️  Tiempo total: ${tiempoTotal} segundos
    `);

  } catch (error) {
    console.error('\n❌ Error fatal en la migración:', error.message);
    process.exit(1);
  }
}

// Ejecutar
main().catch(console.error);
