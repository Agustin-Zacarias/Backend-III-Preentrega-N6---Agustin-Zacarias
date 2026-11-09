import { Router } from "express";
import { createOrder, getOrderById, getOrders, updateOrderStatus } from "../controllers/order.controller.js";

const router = Router();
router.get("/", getOrders);
router.post("/", createOrder);
router.get("/:oid", getOrderById);
router.patch("/:oid/status", updateOrderStatus);
export default router;
