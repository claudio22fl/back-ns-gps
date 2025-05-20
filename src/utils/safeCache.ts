import cache from './cache';
import { defaultTTL } from './cacheTTL';

export const safeCache = async <T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl?: number
): Promise<T> => {
  const cached = cache.get<T>(key);
  if (cached) {
    console.log(`📦 [CACHE HIT] ${key} `);
    return cached;
  }

  console.log(`🛠 [CACHE MISS] Fetching ${key}`);
  const data = await fetchFn();

  const ttlInMinutes = ttl ? ttl : defaultTTL;

  const ttlInSeconds = ttlInMinutes * 60;

  cache.set(key, data, ttlInSeconds);
  return data;
};
