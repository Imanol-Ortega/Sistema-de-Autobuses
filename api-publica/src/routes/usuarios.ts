import { Router } from "express";
import * as userController from "../controller/user.controller";

const userRouter = Router();

userRouter.post("/create", userController.createUser);
userRouter.get("/get", userController.getUsers);
userRouter.post("/login", userController.Login);
userRouter.post("/cargaSaldo", userController.cargaSaldo);
userRouter.post("/restaSaldo", userController.restaSaldo);
userRouter.post("/pagar", userController.pagar);

export { userRouter }