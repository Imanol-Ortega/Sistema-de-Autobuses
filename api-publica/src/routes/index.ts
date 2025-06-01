import { Router } from "express";
import { userRouter } from "./usuarios";
import { busesRouter } from "./buses.route";
import { choferesRouter } from "./choferes.route";


const router = Router();
console.log("llega");
router.use("/usuarios", userRouter);
router.use("/buses", busesRouter);
router.use("/choferes", choferesRouter);

export { router };