import mongoose from "mongoose";
import { DELIVERY_STATUS } from "../constants/index.js";

const deliverySchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(DELIVERY_STATUS),
      required: true,
      default: DELIVERY_STATUS.PENDING,
    },
    assignedAt: {
      type: Date,
      default: null,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const DeliveryModel = mongoose.model("Delivery", deliverySchema);

export default DeliveryModel;
