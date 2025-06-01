import { Router } from "express";
import * as choferesController from "../controller/choferes.controller";

const choferesRouter = Router();

choferesRouter.get("/get", choferesController.getChoferes);


export { choferesRouter }