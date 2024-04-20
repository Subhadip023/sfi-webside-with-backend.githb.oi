import { Schema, model } from "mongoose";

const homeSchema = new Schema({
    name: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String },
    position: { type: Number, default: 0 }, // Add position field with default value of 0
});

export default model("Home", homeSchema);
