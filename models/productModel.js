import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    shipping: {
      type: Boolean,
    },
    photo: {
      data: Buffer,
      contentType: String,
    },
    category: {
      type: mongoose.ObjectId,
      ref: "Category",
      required: true,
    },
  },
  { timestamp: true }
);

export default mongoose.model("Product", productSchema);
