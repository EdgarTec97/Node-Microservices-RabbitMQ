import mongoose from "mongoose";
import * as amqp from "amqplib/callback_api";
import app from "./app";
import { IProduct, Product } from "./entity/product";

mongoose
  .connect("mongodb://root:root@localhost:27017/staging", {})
  .then(() => {
    console.log("Running database...");

    const productRepository = Product;

    amqp.connect("amqp://guest:guest@localhost:5672/", (error0, connection) => {
      if (error0) {
        throw error0;
      }

      connection.createChannel((error1, channel) => {
        if (error1) {
          throw error1;
        }

        channel.assertQueue("product_created_staging", { durable: false });
        channel.assertQueue("product_updated_staging", { durable: false });
        channel.assertQueue("product_deleted_staging", { durable: false });

        channel.consume(
          "product_created_staging",
          async (msg: any) => {
            const eventProduct: IProduct = JSON.parse(msg.content.toString());
            const product = new Product();
            product.admin_id = parseInt(eventProduct.id);
            product.title = eventProduct.title;
            product.image = eventProduct.image;
            product.likes = eventProduct.likes;
            await product.save();
            console.log("product created");
          },
          { noAck: true }
        );

        channel.consume(
          "product_updated_staging",
          async (msg: any) => {
            const eventProduct: IProduct = JSON.parse(msg.content.toString());
            const product = await productRepository.findOne({
              admin_id: parseInt(eventProduct.id),
            });
            if (product) {
              await productRepository.findByIdAndUpdate(product.id, {
                title: eventProduct.title,
                image: eventProduct.image,
                likes: eventProduct.likes,
              });
            }
            console.log("product updated");
          },
          { noAck: true }
        );

        channel.consume("product_deleted_staging", async (msg: any) => {
          const admin_id = parseInt(msg.content.toString());
          await productRepository.deleteOne({ admin_id });
          console.log("product deleted");
        });

        console.log("Listening to port: 8002");
        app.listen(8002);
        process.on("beforeExit", () => {
          console.log("closing");
          connection.close();
        });
      });
    });
  })
  .catch((error) => {
    console.error("Error connecting to database: ", error);
  });
