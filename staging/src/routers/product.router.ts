import express, { Request, Response, Router } from "express";
import axios from "axios";
import { Product } from "../entity/product";

const productRepository = Product;

const ProductRotuer: Router = express.Router();

ProductRotuer.get("/api/products", async (req: Request, res: Response) => {
  const products = await productRepository.find();
  return res.send(products);
});

ProductRotuer.post(
  "/api/products/:id/like",
  async (req: Request, res: Response) => {
    const product = await productRepository.findById(req.params.id);

    if (!product) return res.status(404).send({ message: "Product not found" });

    await axios.post(
      `http://localhost:8000/api/products/${product.admin_id}/like`,
      {}
    );
    product.likes++;
    await product.save();
    return res.send(product);
  }
);

export default ProductRotuer;
