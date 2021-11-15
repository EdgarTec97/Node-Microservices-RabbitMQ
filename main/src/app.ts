import express from "express";
import cors from "cors";
import ProductRotuer from "./routers/product.router";

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

app.use(ProductRotuer);

export default app;
