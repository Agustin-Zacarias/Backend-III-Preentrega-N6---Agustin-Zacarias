import { mockRepository } from "../repositories/mock.repository.js";
import {
  generateMockDataset,
  generateMockOrders,
  generateMockUsers,
  toPublicDataset,
  toPublicUser,
} from "../utils/mock-data.factory.js";
import { USER_ROLES } from "../constants/index.js";
import logger from "../logger/logger.js";
import {
  InvalidMockEntityError,
  InvalidMockQuantityError,
  MockSeedError,
} from "../errors/app-error.js";

const MAX_QTY = 100;

const parseQty = (value = "1") => {
  if (typeof value !== "string" && typeof value !== "number") {
    throw new InvalidMockQuantityError();
  }

  const qty = Number(value);
  if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
    throw new InvalidMockQuantityError();
  }
  return qty;
};

const parseSeedEntity = (value = "users") => {
  if (typeof value !== "string" || !["users", "all"].includes(value)) {
    throw new InvalidMockEntityError();
  }
  return value;
};

// Se intenta revertir la carga en orden inverso para no dejar referencias huérfanas.
const cleanupInsertedData = async ({ userIds, orderIds, deliveryIds }) => {
  const cleanupErrors = [];
  const cleanupOperations = [
    () => deliveryIds.length && mockRepository.deleteDeliveriesByIds(deliveryIds),
    () => orderIds.length && mockRepository.deleteOrdersByIds(orderIds),
    () => userIds.length && mockRepository.deleteUsersByIds(userIds),
  ];

  for (const cleanup of cleanupOperations) {
    try {
      await cleanup();
    } catch (error) {
      cleanupErrors.push(error);
    }
  }

  return cleanupErrors;
};

export const mockService = {
  getUsers: (qtyInput) => {
    const qty = parseQty(qtyInput);
    const users = generateMockUsers(qty, USER_ROLES.USER);
    logger.info("Datos mock de usuarios generados.", { quantity: qty });
    return users.map(toPublicUser);
  },

  getDrivers: (qtyInput) => {
    const qty = parseQty(qtyInput);
    const drivers = generateMockUsers(qty, USER_ROLES.DRIVER);
    logger.info("Datos mock de repartidores generados.", { quantity: qty });
    return drivers.map(toPublicUser);
  },

  getOrders: (qtyInput) => {
    const qty = parseQty(qtyInput);
    const users = generateMockUsers(qty, USER_ROLES.USER);
    const orders = generateMockOrders(qty, users);
    logger.info("Pedidos mock generados en memoria.", { quantity: qty });
    return orders;
  },

  getDeliveries: (qtyInput) => {
    const qty = parseQty(qtyInput);
    const dataset = generateMockDataset(qty);
    logger.info("Entregas mock generadas en memoria.", { quantity: qty });
    return dataset.deliveries;
  },

  getAll: (qtyInput) => {
    const qty = parseQty(qtyInput);
    const dataset = generateMockDataset(qty);
    logger.debug("Conjunto completo de mocks generado en memoria.", { quantity: qty });
    return toPublicDataset(dataset);
  },

  seed: async (qtyInput, entityInput) => {
    const qty = parseQty(qtyInput);
    const entity = parseSeedEntity(entityInput);

    if (entity === "users") {
      const users = generateMockUsers(qty, USER_ROLES.USER);
      const userIds = users.map(({ _id }) => _id);
      try {
        await mockRepository.insertUsers(users);
        logger.info("Carga de usuarios mock completada.", { inserted: users.length });
        return { insertados: users.length, coleccion: "usuarios" };
      } catch (error) {
        const cleanupErrors = await cleanupInsertedData({
          userIds,
          orderIds: [],
          deliveryIds: [],
        });
        const seedError = new MockSeedError(error);
        if (cleanupErrors.length) seedError.details = { rollbackCompleted: false };
        throw seedError;
      }
    }

    const dataset = generateMockDataset(qty);
    const insertedIds = {
      userIds: [...dataset.users, ...dataset.drivers].map(({ _id }) => _id),
      orderIds: dataset.orders.map(({ _id }) => _id),
      deliveryIds: dataset.deliveries.map(({ _id }) => _id),
    };

    try {
      await mockRepository.insertUsers([...dataset.users, ...dataset.drivers]);
      await mockRepository.insertOrders(dataset.orders);
      await mockRepository.insertDeliveries(dataset.deliveries);

      const collections = {
        usuarios: dataset.users.length,
        repartidores: dataset.drivers.length,
        pedidos: dataset.orders.length,
        entregas: dataset.deliveries.length,
      };

      const inserted = Object.values(collections).reduce((sum, count) => sum + count, 0);
      logger.info("Carga completa de datos mock en MongoDB.", {
        inserted,
        collections,
      });
      return {
        insertados: inserted,
        colecciones: collections,
      };
    } catch (error) {
      const cleanupErrors = await cleanupInsertedData(insertedIds);
      const seedError = new MockSeedError(error);
      if (cleanupErrors.length) {
        seedError.details = { rollbackCompleted: false };
      }
      throw seedError;
    }
  },
};
