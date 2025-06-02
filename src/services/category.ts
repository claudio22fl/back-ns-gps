import { Category } from '../models/cotegory';

export const getAllCategoriesService = async () => {
  const categories = await Category.findAll();
  return categories;
};
