import { Router } from "express";
import { userRouter } from "./usuarios";

const router = Router();

router.use("/usuarios", userRouter);

export { router };