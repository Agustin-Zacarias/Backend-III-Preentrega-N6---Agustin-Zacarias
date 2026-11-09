import { orderService } from "../services/order.service.js";
import { asyncHandler } from "../middlewares/async-handler.js";

export const getOrders = asyncHandler(async (_req, res) => {
  const orders = await orderService.getOrders();
  return res.status(200).json({ status: "success", payload: orders });
});

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.params.oid);
  return res.status(200).json({ status: "success", payload: order });
});

export const createOrder = asyncHandler(async (req, res) => {
  const order = await orderService.createOrder(req.body);
  return res.status(201).json({ status: "success", payload: order });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await orderService.updateOrderStatus(req.params.oid, req.body?.status);
  return res.status(200).json({ status: "success", payload: order });
});
