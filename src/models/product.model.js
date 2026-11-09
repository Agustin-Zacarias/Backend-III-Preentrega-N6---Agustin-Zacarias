import mongoose from "mongoose";
import { PRODUCT_STATUS } from "../constants/index.js";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    price: {
      type: Number,
      required: true,
      min: 0.01,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "El stock debe ser un número entero.",
      },
    },
    status: {
      type: String,
      enum: Object.values(PRODUCT_STATUS),
      required: true,
      default: PRODUCT_STATUS.AVAILABLE,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const ProductModel = mongoose.model("Product", productSchema);

export default ProductModel;
