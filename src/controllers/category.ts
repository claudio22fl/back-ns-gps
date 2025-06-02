import { Request, Response } from 'express';
import { getAllCategoriesService } from '../services/category';
import { customResponse } from '../utils/customResponse';
import { safeCache } from '../utils/safeCache';

export const getAllCategories = async (_: Request, res: Response) => {
  try {
    const categories = await safeCache('categories', () => getAllCategoriesService());
    customResponse({
      res,
      statusCode: 200,
      data: categories.length ? categories : undefined,
      message: 'Lista de categorías',
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las categorías' });
  }
};
