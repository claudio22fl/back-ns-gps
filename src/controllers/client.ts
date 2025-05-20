import { Request, Response } from 'express';
import { IPersonDTO } from '../interfaces/client.interface';
import { IGetProductsBody } from '../interfaces/product.interface';
import {
  createClientService,
  deleteClientService,
  getClientByIdService,
  getClientsService,
  updateClientService,
} from '../services/client';
import { customResponse } from '../utils/customResponse';
import { handleHttp } from '../utils/error.handle';
import { invalidateEntity } from '../utils/invalidateCache';
import { safeCache } from '../utils/safeCache';

export const getClients = async (
  { body }: Request<{}, {}, IGetProductsBody>,
  res: Response
): Promise<void> => {
  try {
    const { page = 1, limit = 10, filterValue } = body;
    const cacheKey = `client_page=${page}_limit=${limit}_filter=${filterValue || 'all'}`;
    const { data, pagination } = await safeCache(cacheKey, () =>
      getClientsService(page, limit, filterValue)
    );

    customResponse({
      res,
      statusCode: 200,
      data: data.length ? data : undefined,
      message: 'Lista de clientes',
      pagination: pagination,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching clients', error });
  }
};

export const getClientById = async (req: Request, res: Response): Promise<void> => {
  try {
    const client = await safeCache(
      `client_${req.params.id}`,
      () => getClientByIdService(req.params.id),
      5
    );

    if (!client) {
      customResponse({
        res,
        statusCode: 404,
        message: 'Client not found',
        data: null,
      });

      return;
    }
    customResponse({
      res,
      statusCode: 200,
      message: 'Client found',
      data: client,
    });
  } catch (error) {
    handleHttp(res, 'ERROR_GET_CLIENT', error);
  }
};

export const createClient = async (
  { body }: Request<{}, {}, IPersonDTO>,
  res: Response
): Promise<void> => {
  try {
    const newClient = await createClientService(body);
    invalidateEntity(`client`);
    customResponse({
      res,
      statusCode: 201,
      message: 'Client created successfully',
      data: newClient,
    });
  } catch (error) {
    handleHttp(res, 'ERROR_CREATE_CLIENT', error);
  }
};

export const updateClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedClient = await updateClientService(req.params.id, req.body);
    invalidateEntity(`client`);
    if (!updatedClient) {
      customResponse({
        res,
        statusCode: 404,
        message: 'Update failed, client not found',
        data: null,
      });
      return;
    }
    customResponse({
      res,
      statusCode: 200,
      message: 'Client updated successfully',
      data: true,
    });
  } catch (error) {
    handleHttp(res, 'ERROR_UPDATE_CLIENT', error);
  }
};

export const deleteClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await deleteClientService(req.params.id);
    invalidateEntity(`client`);
    if (!deleted) {
      customResponse({
        res,
        statusCode: 404,
        message: 'Client not found',
        data: null,
      });
      return;
    }
    customResponse({
      res,
      statusCode: 200,
      message: 'Client deleted successfully',
      data: null,
    });
  } catch (error) {
    handleHttp(res, 'ERROR_DELETE_CLIENT', error);
  }
};
