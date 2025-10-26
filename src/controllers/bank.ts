import { Request, Response } from 'express';
import {
  createBankService,
  deleteBankService,
  getAllBanks,
  getAllBanksSimple,
  getBankById,
  updateBankService,
} from '../services/bank';
import { customResponse } from '../utils/customResponse';
import { handleHttp } from '../utils/error.handle';

// GET /bank - Obtener todos los bancos con paginación
export const getBanks = async (req: Request, res: Response) => {
  try {
    console.log('🏦 === GET /bank ===');
    const { page = 1, limit = 10, filterValue = '' } = req.query;

    const { data, pagination } = await getAllBanks(
      Number(page),
      Number(limit),
      String(filterValue)
    );

    customResponse({
      res,
      statusCode: 200,
      data: data.length ? data : undefined,
      message: 'Lista de bancos',
      pagination: pagination,
    });
  } catch (error) {
    handleHttp(res, 'ERROR_GET_BANKS', error);
  }
};

// GET /bank/simple - Obtener todos los bancos sin paginación (para dropdowns)
export const getBanksSimple = async (_: Request, res: Response) => {
  try {
    const banks = await getAllBanksSimple();

    customResponse({
      res,
      statusCode: 200,
      data: banks.length ? banks : undefined,
      message: 'Lista simple de bancos',
    });
  } catch (error) {
    handleHttp(res, 'ERROR_GET_BANKS_SIMPLE', error);
  }
};

// GET /bank/:id - Obtener banco por ID
export const getBank = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const bank = await getBankById(Number(id));

    if (!bank) {
      return handleHttp(res, 'BANK_NOT_FOUND', 404);
    }

    customResponse({
      res,
      statusCode: 200,
      data: bank,
      message: 'Banco encontrado',
    });
  } catch (error) {
    handleHttp(res, 'ERROR_GET_BANK', error);
  }
};

// POST /bank - Crear nuevo banco
export const createBank = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return handleHttp(res, 'BANK_NAME_REQUIRED', 400);
    }

    const bank = await createBankService({ name: name.trim() });

    customResponse({
      res,
      statusCode: 201,
      data: bank,
      message: 'Banco creado correctamente',
    });
  } catch (error) {
    handleHttp(res, 'ERROR_CREATE_BANK', error);
  }
};

// PUT /bank/:id - Actualizar banco
export const updateBank = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return handleHttp(res, 'BANK_NAME_REQUIRED', 400);
    }

    const bank = await updateBankService(Number(id), { name: name.trim() });

    if (!bank) {
      return handleHttp(res, 'BANK_NOT_FOUND', 404);
    }

    customResponse({
      res,
      statusCode: 200,
      data: bank,
      message: 'Banco actualizado correctamente',
    });
  } catch (error) {
    handleHttp(res, 'ERROR_UPDATE_BANK', error);
  }
};

// DELETE /bank/:id - Eliminar banco
export const deleteBank = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await deleteBankService(Number(id));

    if (!deleted) {
      return handleHttp(res, 'BANK_NOT_FOUND', 404);
    }

    customResponse({
      res,
      statusCode: 200,
      data: { deleted: true },
      message: 'Banco eliminado correctamente',
    });
  } catch (error) {
    handleHttp(res, 'ERROR_DELETE_BANK', error);
  }
};
