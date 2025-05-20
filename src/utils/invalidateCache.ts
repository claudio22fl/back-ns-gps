import cache from './cache';

export const invalidateEntity = (prefix: string) => {
  const keys = cache.keys();
  const filtered = keys.filter((key) => key.startsWith(prefix));
  cache.del(filtered);

  console.log(`🧹 Cache invalidada para ${prefix}. Claves eliminadas:`, filtered);
};
