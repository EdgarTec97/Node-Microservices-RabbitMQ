import express, { Request, Response, Router } from "express";
import { Product } from "../entity/product";
import * as amqp from "amqplib/callback_api";
import { Connection, Repository } from "typeorm";

export default class ProductRotuerClass {
  private productRepository: Repository<Product>;
  constructor(private channel: amqp.Channel, private db: Connection) {
    this.productRepository = db.getRepository(Product);
  }

  getEndpoints() {
    const ProductRotuer: Router = express.Router();

    ProductRotuer.post(
      "/api/products/:id/like",
      async (req: Request, res: Response) => {
        const product = await this.productRepository.findOne(req.params.id);
        if (!product)
          return res.status(404).send({ message: "Product not found" });
        product.likes++;
        const result = await this.productRepository.save(product);
        return res.send(result);
      }
    );
    ProductRotuer.get("/api/products", async (req: Request, res: Response) => {
      const products = await this.productRepository.find();
      res.json(products);
    });

    ProductRotuer.post("/api/products", async (req: Request, res: Response) => {
      const product = await this.productRepository.create(req.body);
      const result = await this.productRepository.save(product);
      this.channel.sendToQueue(
        "product_created_staging",
        Buffer.from(JSON.stringify(result)),
        { persistent: true }
      );
      this.channel.sendToQueue(
        "product_created",
        Buffer.from(JSON.stringify(result)),
        { persistent: true }
      );
      return res.send(result);
    });

    ProductRotuer.get(
      "/api/products/:id",
      async (req: Request, res: Response) => {
        const product = await this.productRepository.findOne(req.params.id);

        if (!product)
          return res.status(404).send({ message: "Product not found" });

        return res.send(product);
      }
    );

    ProductRotuer.put(
      "/api/products/:id",
      async (req: Request, res: Response) => {
        const product = await this.productRepository.findOne(req.params.id);
        if (!product)
          return res.status(404).send({ message: "Product not found" });
        this.productRepository.merge(product, req.body);
        const result = await this.productRepository.save(product);
        this.channel.sendToQueue(
          "product_updated_staging",
          Buffer.from(JSON.stringify(result)),
          { persistent: true }
        );
        this.channel.sendToQueue(
          "product_updated",
          Buffer.from(JSON.stringify(result)),
          { persistent: true }
        );
        return res.send(result);
      }
    );

    ProductRotuer.delete(
      "/api/products/:id",
      async (req: Request, res: Response) => {
        const result = await this.productRepository.delete(req.params.id);
        this.channel.sendToQueue(
          "product_deleted_staging",
          Buffer.from(req.params.id),
          { persistent: true }
        );
        this.channel.sendToQueue(
          "product_deleted",
          Buffer.from(req.params.id),
          { persistent: true }
        );
        return res.send(result);
      }
    );

    ProductRotuer.post(
      "/api/products/:id/like",
      async (req: Request, res: Response) => {
        const product = await this.productRepository.findOne(req.params.id);
        if (!product)
          return res.status(404).send({ message: "Product not found" });
        product.likes++;
        const result = await this.productRepository.save(product);
        return res.send(result);
      }
    );

    return ProductRotuer;
  }
}
