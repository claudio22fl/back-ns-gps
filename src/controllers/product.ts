import { Request, Response } from "express";
import {
  createProductService,
  deleteProductService,
  getAllProducts,
  getProductById,
  updateProductService,
} from "../services/product";
import { customResponse } from "../utils/customResponse";
import { handleHttp } from "../utils/error.handle";

const getProducts = async (req: Request, res: Response) => {
  try {
    res.send(await getAllProducts());
  } catch (error) {
    handleHttp(res, "ERROR_GET_PRODUCTS");
  }
};

const getProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    res.send(await getProductById(+id));
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
      data: product,
    });
  } catch (error) {
    handleHttp(res, "ERROR_DELETE_PRODUCT");
  }
};

export { createProduct, deleteProduct, getProduct, getProducts, updateProduct };
