import { Request, Response } from "express";
import { createUser, loginUser } from "../services/auth";
import { customResponse } from "../utils/customResponse";
import { handleHttp } from "../utils/error.handle";

export const loginController = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const result = await loginUser(email, password);
    customResponse({
      res,
      data: result,
      message: "Inicio de sesión exitoso",
    });
  } catch (err) {
    handleHttp(res, "ERROR_LOGIN", err);
  }
};

export const registerController = async (req: Request, res: Response) => {
  try {
    const newUser = await createUser(req.body);
    customResponse({
      res,
      data: newUser,
      message: "Usuario creado exitosamente",
    });
  } catch (err) {
    handleHttp(res, "ERROR_CREATE_USER", err);
  }
};
