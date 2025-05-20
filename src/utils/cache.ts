import NodeCache from 'node-cache';

const cache = new NodeCache({
  stdTTL: 60 * 5, // 5 minutos de duración por defecto
  checkperiod: 120, // Limpia elementos expirados cada 2 minutos
  useClones: false,
});

export default cache;
