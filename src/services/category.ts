import { Category } from '../models/category';

export const getAllCategoriesService = async () => {
  const categories = await Category.findAll();
  return categories;
};
