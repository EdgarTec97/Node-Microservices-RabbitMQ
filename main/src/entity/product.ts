import { model, Model, Schema, Document } from "mongoose";

export interface IProduct extends Document {
  id: string;
  admin_id: number;
  title: string;
  image: string;
  likes: number;
}

const ProductSchema: Schema = new Schema({
  id: { type: String, require: true, trim: true },
  admin_id: { type: Number, require: true, trim: true },
  title: { type: String, required: true, unique: true },
  image: { type: String, required: true },
  likes: { type: Number, required: true },
});

export const Product: Model<IProduct> = model("Product", ProductSchema);
