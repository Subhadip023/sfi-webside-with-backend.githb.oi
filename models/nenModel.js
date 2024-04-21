import { Schema, model } from "mongoose";

const nenSchema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    thumbnail: { type: String, require: true },
    type: { type: String, require: true },
  },
  { timestamps: true }
);
export default model("nen", nenSchema);
