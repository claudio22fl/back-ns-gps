// utils/customResponse.ts
import { Response } from "express";
import { IPagination } from "../interfaces/shared.iterface";

interface CustomResponseOptions {
  res: Response;
  statusCode?: number;
  data?: any;
  message?: string;
  pagination?: IPagination | null;
}

export const customResponse = ({
  res,
  statusCode = 200,
  data = null,
  message = "Success",
  pagination = null,
}: CustomResponseOptions) => {
  res.status(statusCode).json({
    status: statusCode,
    data,
    date: new Date().toISOString(),
    message,
    pagination,
  });
};
