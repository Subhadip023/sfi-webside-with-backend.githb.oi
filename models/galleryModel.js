import { Schema, model } from "mongoose";

const gallerySchema = new Schema(
  {
    title: { type: String, required: true },
    image: { type: String, require: true },
    banner: { type: String },
  });
export default model("Gallery", gallerySchema);
