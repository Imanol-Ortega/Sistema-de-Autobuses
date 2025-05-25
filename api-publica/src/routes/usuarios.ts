import { Router } from "express";

const userRouter = Router();

userRouter.get("/", (req, res) => { res.json({ response: "ok" }) });

export { userRouter }