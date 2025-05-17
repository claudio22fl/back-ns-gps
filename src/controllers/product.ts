import { Request, Response } from "express";
import { IGetProductsBody } from "../interfaces/product.interface";
import {
  createProductService,
  deleteProductService,
  getAllProducts,
  getProductById,
  updateProductService,
} from "../services/product";
import { customResponse } from "../utils/customResponse";
import { handleHttp } from "../utils/error.handle";

const getProducts = async (
  { body }: Request<{}, {}, IGetProductsBody>,
  res: Response
) => {
  try {
    const { page = 1, limit = 10, filerValue } = body;
    const { data, pagination } = await getAllProducts(page, limit, filerValue);

    customResponse({
      res,
      statusCode: 200,
      data: data.length ? data : undefined,
      message: "Lista de productos",
      pagination: pagination,
    });
  } catch (error) {
    handleHttp(res, "ERROR_GET_PRODUCTS");
  }
};

const getProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await getProductById(+id);
    if (!product) {
      return handleHttp(res, "PRODUCT_NOT_FOUND", 404);
    }
    customResponse({
      res,
      statusCode: 200,
      data: product,
      message: "Producto encontrado",
    });
  } catch (error) {
    handleHttp(res, "ERROR_GET_PRODUCT");
  }
};

const createProduct = async (req: Request, res: Response) => {
  try {
    const product = await createProductService(req.body);
    customResponse({
      res,
      statusCode: 201,
      data: product,
      message: "Producto creado correctamente",
    });
  } catch (error) {
    handleHttp(res, "ERROR_CREATE_PRODUCT", error);
  }
};

const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { body } = req;
    const product = await updateProductService(+id, body);
    customResponse({
      res,
      statusCode: 200,
      data: true,
      message: "Producto actualizado correctamente",
    });
  } catch (error) {
    handleHttp(res, "ERROR_UPDATE_PRODUCT");
  }
};

const deleteProduct = async ({ params }: Request, res: Response) => {
  try {
    const { id } = params;
    const product = await deleteProductService(+id);
    customResponse({
      res,
      statusCode: 200,
      message: "Producto eliminado correctamente",
      data: true,
    });
  } catch (error) {
    handleHttp(res, "ERROR_DELETE_PRODUCT");
  }
};

export { createProduct, deleteProduct, getProduct, getProducts, updateProduct };
