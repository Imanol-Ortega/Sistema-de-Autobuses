import { Request, Response } from 'express';
import { successResponse, validateError } from '../utils';
import { userService } from '../services/user.service';
export const getUsers = async (req: Request, res: Response) => {
  try {
    const response = await userService.getAllUsers();
    successResponse({ response }, res);
  } catch (error) {
    console.error("Error fetching users:", error);
    validateError(error, res);
  }

};

export const createUser = async (req: Request, res: Response) => {
  try {
    const userData = req.body;
    const response = await userService.registerUser(userData);
    successResponse({ response }, res);

  } catch (error) {
    console.error("Error creating user:", error);
    res.status(400).json({
      error: "Error creating user",
    });
  }
};

export const Login = async (req: Request, res: Response): Promise<any> => {

  try {
    const { password, email } = req.body;
    if (!password || !email) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const response = await userService.loginUser(email, password);
    return successResponse({ response }, res);

  } catch (error) {
    console.error("Error creating user:", error);
    res.status(400).json({
      error: "Error creating user",
    });
  }
};

export const cargaSaldo = async (req: Request, res: Response): Promise<any> => {
  console.log("Entra funcion cargaSaldo en api");
  //llamado al api
  try {
    console.log("ingresa primer try de funcion cargaSaldo en api");
    const { monto, user_id } = req.body;
    if (!monto || !user_id) {
      return res.status(400).json({ error: "user_id and monto are required" });
    }

    const response = await userService.CargaSaldos(monto, user_id);
    console.log("funcion cargaSaldo en api. response: ", response);
    successResponse({ response }, res);

  } catch (error) {
    console.error("Error updating user:", error);
    res.status(400).json({
      error: "Error updating user",
    });
  }
}

export const restaSaldo = async (req: Request, res: Response): Promise<any> => {
  console.log("Entra funcion restaSaldo en api");
  try {
    console.log("ingresa primer try de funcion restaSaldo en api");
    const { monto, user_id } = req.body;
    if (!monto || !user_id) {
      return res.status(400).json({ error: "user_id and monto are required" });
    }

    const response = await userService.restaSaldos(monto, user_id);
    console.log("funcion restaSaldo en api. response: ", response);
    successResponse({ response }, res);

  } catch (error) {
    console.error("Error updating saldo:", error);
    res.status(400).json({
      error: "Error updating user",
    });
  }
}

export const pagar = async (req: Request, res: Response): Promise<any> => {
  try {
    const { bus_id, user_id } = req.body;
    const monto = 5000;
    if (!monto || !user_id || !bus_id) {
      return res.status(400).json({ error: "user_id and monto are required" });
    }

    const saldoSuficiente = await userService.verificarSaldoSuficiente(user_id, monto);

    if (!saldoSuficiente) {
      return res.status(400).json({ error: "Saldo insuficiente" });
    }

    await userService.restaSaldos(monto, user_id);

    // await userService.pagar(monto, bus_id);

    successResponse({ response: "ok" }, res);

  } catch (error) {
    console.error("Error updating saldo:", error);
    res.status(400).json({
      error: "Error updating user",
    });
  }
}

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  successResponse({ response: "ok" }, res);
};
