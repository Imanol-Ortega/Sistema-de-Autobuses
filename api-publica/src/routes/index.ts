import { Router } from "express";
import { userRouter } from "./usuarios";

const router = Router();
console.log("llega");
router.use("/usuarios", userRouter);

export { router };