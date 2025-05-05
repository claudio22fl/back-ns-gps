import { Request, Response } from "express";
import { loginUser } from "../services/auth";
import { customResponse } from "../utils/customResponse";
import { handleHttp } from "../utils/error.handle";

export const loginController = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const result = await loginUser(username, password);
    customResponse({
      res,
      data: result,
      message: "Inicio de sesión exitoso",
    });
  } catch (err) {
    handleHttp(res, "ERROR_LOGIN", err);
  }
};
