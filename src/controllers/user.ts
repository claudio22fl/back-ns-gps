import { Request, Response } from 'express';
import { getAllUsers } from '../services/user';
import { customResponse } from '../utils/customResponse';
import { handleHttp } from '../utils/error.handle';

export const getUsers = async (_: Request, res: Response) => {
  try {
    const response = await getAllUsers();

    customResponse({
      res,
      statusCode: 200,
      data: response.length ? response : undefined,
      message: 'Lista de usuarios',
    });
  } catch (error) {
    handleHttp(res, 'ERROR_GET_USERS', error);
  }
};
