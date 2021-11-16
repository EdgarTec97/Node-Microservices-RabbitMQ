import { createConnection } from "typeorm";
import App from "./app";
import * as amqp from "amqplib/callback_api";

createConnection().then((db) => {
  amqp.connect("amqp://guest:guest@localhost:5672/", (error0, connection) => {
    if (error0) {
      throw error0;
    }

    connection.createChannel((error1, channel) => {
      if (error1) {
        throw error1;
      }

      channel.assertQueue("product_created_staging");
      channel.assertQueue("product_updated_staging");
      channel.assertQueue("product_deleted_staging");

      channel.assertQueue("product_created");
      channel.assertQueue("product_updated");
      channel.assertQueue("product_deleted");

      console.log("Listening to port: 8000");

      const backend = new App(channel, db);

      const app = backend.middleware();
      app.listen(8000);
      process.on("beforeExit", () => {
        console.log("closing");
        connection.close();
      });
    });
  });
});
