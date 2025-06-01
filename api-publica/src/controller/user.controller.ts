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

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userData = req.body;
  successResponse({ response: "ok" }, res);
};

