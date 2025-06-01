import { Router } from "express";
import * as busesController from "../controller/buses.controller";

const busesRouter = Router();

busesRouter.get("/get", busesController.getBuses);


export { busesRouter }