import { Router } from "express";
import { testLogger } from "../controllers/logger.controller.js";

const router = Router();

router.get("/", testLogger);

export default router;
