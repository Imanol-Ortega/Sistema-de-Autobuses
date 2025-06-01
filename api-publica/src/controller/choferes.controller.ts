import { Request, Response } from 'express';
import { successResponse, validateError } from '../utils';
import { busesService } from '../services/buses.service';

export const getChoferes = async (req: Request, res: Response) => {
  try {
    const response = await busesService.getAllBuses();
    successResponse({ response }, res);
  } catch (error) {
    console.error("Error fetching users:", error);
    validateError(error, res);
  }

};
