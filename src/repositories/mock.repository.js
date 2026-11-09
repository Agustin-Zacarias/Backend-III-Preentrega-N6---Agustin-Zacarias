import UserModel from "../models/user.model.js";
import OrderModel from "../models/order.model.js";
import DeliveryModel from "../models/delivery.model.js";

export const mockRepository = {
  insertUsers: (users) => UserModel.insertMany(users),
  insertOrders: (orders) => OrderModel.insertMany(orders),
  insertDeliveries: (deliveries) => DeliveryModel.insertMany(deliveries),

  deleteUsersByIds: (ids) => UserModel.deleteMany({ _id: { $in: ids } }),
  deleteOrdersByIds: (ids) => OrderModel.deleteMany({ _id: { $in: ids } }),
  deleteDeliveriesByIds: (ids) => DeliveryModel.deleteMany({ _id: { $in: ids } }),
};
