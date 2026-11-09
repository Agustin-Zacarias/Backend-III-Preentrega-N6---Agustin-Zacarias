import { Router } from "express";
import {
  getMockUsers,
  getMockDrivers,
  getMockOrders,
  getMockDeliveries,
  getAllMocks,
  seedMocks,
} from "../controllers/mock.controller.js";

const router = Router();

router.get("/users", getMockUsers);
router.get("/drivers", getMockDrivers);
router.get("/orders", getMockOrders);
router.get("/deliveries", getMockDeliveries);
router.get("/all", getAllMocks);
router.post("/seed", seedMocks);

export default router;
