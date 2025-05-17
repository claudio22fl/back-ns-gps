import { IPagination } from "../interfaces/shared.iterface";
import Product from "../models/product";
import { generateWhereClause } from "../utils/sequelize-filter.util";

export const getAllProducts = async (
  page: number = 1,
  limit: number = 10,
  filterValue: string = ""
): Promise<{
  data: Product[];
  pagination: IPagination;
}> => {
  const offset = (page - 1) * limit;
  const whereClause = generateWhereClause(Product, filterValue);

  const { count: total, rows: data } = await Product.findAndCountAll({
    where: whereClause,
    offset,
    limit,
  });

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
  };
};

export const getProductById = async (id: number): Promise<Product | null> => {
  return await Product.findByPk(id);
};

export const createProductService = async (
  productData: Omit<Product, "id">
): Promise<Product> => {
  const newProduct = await Product.create(productData as any);
  return newProduct;
};

export const updateProductService = async (
  id: number,
  productData: Partial<Product>
): Promise<Product | null> => {
  const product = await Product.findByPk(id);
  if (!product) return null;

  await product.update(productData);
  return product;
};

export const deleteProductService = async (id: number): Promise<boolean> => {
  const product = await Product.findByPk(id);
  if (!product) return false;

  await product.destroy();
  return true;
};
