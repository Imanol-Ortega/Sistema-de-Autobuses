import { Application } from "express";
import express from 'express';
import { router } from "./routes";

export class Server {
  readonly app: Application;
  readonly port: number;

  constructor() {
    this.app = express();
    this.port = 3000;
    this.app.use(express.json());
    this.initRoutes();
  }

  async init(onStart: () => void) {
    this.app.listen(this.port, onStart);
  }

  async initRoutes() {
    this.app.use("/api", router);
  }
}