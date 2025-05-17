import { Request, Response } from "express";
import { IGetProductsBody } from "../interfaces/product.interface";
import { getAllCompanys, getCompaniesService } from "../services/company";
import { customResponse } from "../utils/customResponse";
import { handleHttp } from "../utils/error.handle";

export const getCompany = async (req: Request, res: Response) => {
  try {
    const response = await getAllCompanys();

    customResponse({
      res,
      statusCode: 200,
      data: response.length ? response : undefined,
      message: "Lista de compañias",
    });
  } catch (error) {
    handleHttp(res, "ERROR_GET_COMPANY", error);
  }
};

export const getAllCompany = async (
  { body }: Request<{}, {}, IGetProductsBody>,
  res: Response
): Promise<void> => {
  try {
    const { page = 1, limit = 10, filerValue } = body;

    const { data, pagination } = await getCompaniesService(
      page,
      limit,
      filerValue
    );
    customResponse({
      res,
      statusCode: 200,
      data: data.length ? data : undefined,
      message: "company list",
      pagination: pagination,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching companys", error });
  }
};
