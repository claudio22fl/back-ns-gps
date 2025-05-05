import Product from "../models/product";

export const getAllProducts = async (): Promise<Product[]> => {
  try {
    return await Product.findAll();
  } catch (error) {
    throw new Error("Error al obtener los productos");
  }
};

export const getProductById = async (id: number): Promise<Product | null> => {
  try {
    return await Product.findByPk(id);
  } catch (error) {
    throw new Error("Error al obtener el producto");
  }
};

export const createProductService = async (
  productData: Omit<Product, "id">
): Promise<Product> => {
  try {
    const newProduct = await Product.create(productData as any);
    return newProduct;
  } catch (error) {
    throw new Error("Error al crear el producto");
  }
};

export const updateProductService = async (
  id: number,
  productData: Partial<Product>
): Promise<Product | null> => {
  try {
    const product = await Product.findByPk(id);
    if (!product) return null;

    await product.update(productData);
    return product;
  } catch (error) {
    throw new Error("Error al actualizar el producto");
  }
};

export const deleteProductService = async (id: number): Promise<boolean> => {
  try {
    const product = await Product.findByPk(id);
    if (!product) return false;

    await product.destroy();
    return true;
  } catch (error) {
    throw new Error("Error al eliminar el producto");
  }
};
