import OrderModel from "../models/order.model.js";

export const orderRepository = {
  findAll: () => OrderModel.find().sort({ createdAt: -1 }).lean(),
  findById: (id) => OrderModel.findById(id).lean(),
  create: async (data) => {
    const order = await OrderModel.create(data);
    return OrderModel.findById(order._id).lean();
  },
  updateStatus: (id, status) =>
    OrderModel.findByIdAndUpdate(id, { status }, { new: true, runValidators: true }).lean(),
};
