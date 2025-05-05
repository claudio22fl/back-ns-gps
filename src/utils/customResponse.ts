// utils/customResponse.ts
import { Response } from "express";

interface CustomResponseOptions {
  res: Response;
  statusCode?: number;
  data?: any;
  message?: string;
}

export const customResponse = ({
  res,
  statusCode = 200,
  data = null,
  message = "Success",
}: CustomResponseOptions) => {
  res.status(statusCode).json({
    status: statusCode,
    data,
    date: new Date().toISOString(),
    message,
  });
};
