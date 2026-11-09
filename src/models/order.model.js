import mongoose from "mongoose";
import { ORDER_PRIORITY, ORDER_STATUS } from "../constants/index.js";

const orderItemSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: "La cantidad debe ser un número entero.",
      },
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0.01,
    },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items) => Array.isArray(items) && items.length > 0,
        message: "El pedido debe contener al menos un producto.",
      },
    },
    total: {
      type: Number,
      required: true,
      min: 0.01,
    },
    shippingAddress: {
      street: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      province: { type: String, required: true, trim: true },
      postalCode: { type: String, required: true, trim: true },
    },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      required: true,
      default: ORDER_STATUS.PENDING,
    },
    priority: {
      type: String,
      enum: Object.values(ORDER_PRIORITY),
      required: true,
      default: ORDER_PRIORITY.NORMAL,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const OrderModel = mongoose.model("Order", orderSchema);

export default OrderModel;
