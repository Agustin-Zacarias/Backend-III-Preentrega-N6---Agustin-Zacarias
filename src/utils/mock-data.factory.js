import { randomBytes, randomUUID } from "node:crypto";
import {
  DELIVERY_STATUS,
  ORDER_PRIORITY,
  ORDER_STATUS,
  USER_ROLES,
} from "../constants/index.js";

const FIRST_NAMES = ["Ana", "Luis", "Sofía", "Mateo", "Valentina", "Tomás", "Camila", "Joaquín"];
const LAST_NAMES = ["Pérez", "Gómez", "Fernández", "López", "Martínez", "Rodríguez", "Díaz", "Sánchez"];
const STREETS = ["Av. del Libertador", "Calle Sarmiento", "Av. Cabildo", "Calle Belgrano", "Av. Maipú"];
const CITIES = ["Tigre", "San Isidro", "Vicente López", "San Fernando", "Buenos Aires"];
const PROVINCES = ["Buenos Aires", "CABA"];
const PRODUCT_NAMES = ["Café molido", "Yerba mate", "Galletitas", "Arroz", "Aceite de girasol", "Leche"];

const pick = (values) => values[Math.floor(Math.random() * values.length)];
const randomInteger = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
// ObjectId válido generado sin depender de una conexión a MongoDB. Mongoose lo castea al persistir.
const newId = () => randomBytes(12).toString("hex");

const createMockUser = (role) => {
  const firstName = pick(FIRST_NAMES);
  const lastName = pick(LAST_NAMES);
  const uniquePart = randomUUID();

  const now = new Date();

  return {
    _id: newId(),
    firstName,
    lastName,
    email: `mock.${role.toLowerCase()}.${uniquePart}@shipnow.test`,
    // El modelo actual requiere password. No se expone en las respuestas de mocks.
    password: randomUUID(),
    role,
    createdAt: now,
    updatedAt: now,
  };
};

export const generateMockUsers = (qty, role = USER_ROLES.USER) =>
  Array.from({ length: qty }, () => createMockUser(role));

const createMockOrder = (user, status = pick(Object.values(ORDER_STATUS))) => {
  const items = Array.from({ length: randomInteger(1, 3) }, () => ({
    productName: pick(PRODUCT_NAMES),
    quantity: randomInteger(1, 4),
    unitPrice: Number((Math.random() * 9000 + 500).toFixed(2)),
  }));

  const total = Number(
    items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0).toFixed(2),
  );

  const now = new Date();

  return {
    _id: newId(),
    user: user._id,
    items,
    total,
    shippingAddress: {
      street: `${pick(STREETS)} ${randomInteger(100, 4500)}`,
      city: pick(CITIES),
      province: pick(PROVINCES),
      postalCode: String(randomInteger(1000, 1900)),
    },
    status,
    priority: pick(Object.values(ORDER_PRIORITY)),
    createdAt: now,
    updatedAt: now,
  };
};

export const generateMockOrders = (qty, users = generateMockUsers(qty)) =>
  Array.from({ length: qty }, (_, index) =>
    createMockOrder(users[index % users.length]),
  );

const createMockDelivery = (order, driver) => {
  const now = new Date();

  return {
    _id: newId(),
    order: order._id,
    driver: driver._id,
    status: DELIVERY_STATUS.ASSIGNED,
    assignedAt: now,
    deliveredAt: null,
    createdAt: now,
    updatedAt: now,
  };
};

export const generateMockDataset = (qty) => {
  const users = generateMockUsers(qty, USER_ROLES.USER);
  const drivers = generateMockUsers(qty, USER_ROLES.DRIVER);
  const orders = Array.from({ length: qty }, (_, index) =>
    createMockOrder(users[index % users.length], ORDER_STATUS.READY_FOR_DELIVERY),
  );
  const deliveries = orders.map((order, index) =>
    createMockDelivery(order, drivers[index % drivers.length]),
  );

  return { users, drivers, orders, deliveries };
};

export const toPublicUser = ({ password, ...user }) => user;

export const toPublicDataset = (dataset) => ({
  users: dataset.users.map(toPublicUser),
  drivers: dataset.drivers.map(toPublicUser),
  orders: dataset.orders,
  deliveries: dataset.deliveries,
});
