import { mockService } from "../services/mock.service.js";
import { asyncHandler } from "../middlewares/async-handler.js";

export const getMockUsers = asyncHandler(async (req, res) => {
  const users = mockService.getUsers(req.query.qty);
  return res.status(200).json(users);
});

export const getMockDrivers = asyncHandler(async (req, res) => {
  const drivers = mockService.getDrivers(req.query.qty);
  return res.status(200).json(drivers);
});

export const getMockOrders = asyncHandler(async (req, res) => {
  const orders = mockService.getOrders(req.query.qty);
  return res.status(200).json(orders);
});

export const getMockDeliveries = asyncHandler(async (req, res) => {
  const deliveries = mockService.getDeliveries(req.query.qty);
  return res.status(200).json(deliveries);
});

export const getAllMocks = asyncHandler(async (req, res) => {
  const dataset = mockService.getAll(req.query.qty);
  return res.status(200).json(dataset);
});

export const seedMocks = asyncHandler(async (req, res) => {
  const result = await mockService.seed(req.query.qty, req.query.entity);
  return res.status(201).json(result);
});
