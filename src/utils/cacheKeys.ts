export const cacheKeys = {
  companies: 'all_companies',
  products: 'all_products',
  users: 'all_users',
  // agrega más entidades según necesites
};

export type CacheKey = keyof typeof cacheKeys;
