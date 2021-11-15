import express from "express";
import * as amqp from "amqplib/callback_api";
import { Connection } from "typeorm";
import cors from "cors";
import ProductRotuerClass from "./routers/product.router";

export default class App {
  constructor(private channel: amqp.Channel, private db: Connection) {}

  middleware() {
    const app = express();

    app.use(
      cors({
        origin: [
          "http://localhost:3000",
          "http://localhost:8080",
          "http://localhost:4200",
        ],
      })
    );

    app.use(express.json());

    const productRouter = new ProductRotuerClass(this.channel, this.db);

    app.use(productRouter.getEndpoints());

    return app;
  }
}
