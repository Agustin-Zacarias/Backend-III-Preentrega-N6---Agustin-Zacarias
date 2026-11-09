import fs from "node:fs";
import dotenv from "dotenv";
import mongoose from "mongoose";
import UserModel from "../src/models/user.model.js";
import ProductModel from "../src/models/product.model.js";
import OrderModel from "../src/models/order.model.js";
import DeliveryModel from "../src/models/delivery.model.js";

// Carga únicamente la configuración de pruebas; nunca reutiliza MONGODB_URI.
dotenv.config({ path: ".env.test", override: true });
process.env.NODE_ENV = "test";

const TEST_URI = process.env.MONGODB_URI_TEST;
const getDatabaseName = (uri) => {
  try {
    return decodeURIComponent(new URL(uri).pathname.replace(/^\/+/, ""));
  } catch {
    throw new Error("MONGODB_URI_TEST no es una URI válida.");
  }
};

const cleanDatabase = async () => {
  await Promise.all([
    UserModel.deleteMany({}),
    ProductModel.deleteMany({}),
    OrderModel.deleteMany({}),
    DeliveryModel.deleteMany({}),
  ]);
};

export const mochaHooks = {
  beforeAll: async function () {
    if (!TEST_URI?.trim()) {
      throw new Error(
        "Falta MONGODB_URI_TEST. Creá .env.test a partir de .env.test.example y configurá una base de datos exclusiva para testing.",
      );
    }

    const testDatabaseName = getDatabaseName(TEST_URI);
    if (!/(^|[_-])test($|[_-])/i.test(testDatabaseName)) {
      throw new Error(
        `La base de testing debe tener 'test' en su nombre. Base detectada: '${testDatabaseName}'. Se canceló la conexión por seguridad.`,
      );
    }

    // Segunda barrera: si existe .env, impide usar exactamente el mismo URI de desarrollo.
    if (fs.existsSync(".env")) {
      const developmentEnv = dotenv.parse(fs.readFileSync(".env"));
      if (developmentEnv.MONGODB_URI && developmentEnv.MONGODB_URI === TEST_URI) {
        throw new Error("MONGODB_URI_TEST no puede ser igual a MONGODB_URI de desarrollo.");
      }
      const developmentDatabaseName = developmentEnv.MONGODB_URI
        ? getDatabaseName(developmentEnv.MONGODB_URI)
        : null;
      if (developmentDatabaseName && developmentDatabaseName === testDatabaseName) {
        throw new Error("La base de testing debe ser distinta de la base de desarrollo.");
      }
    }

    await mongoose.connect(TEST_URI);
    await Promise.all([
      UserModel.init(),
      ProductModel.init(),
      OrderModel.init(),
      DeliveryModel.init(),
    ]);
    await cleanDatabase();
  },

  beforeEach: async function () {
    await cleanDatabase();
  },

  afterAll: async function () {
    if (mongoose.connection.readyState !== 0) {
      await cleanDatabase();
      await mongoose.disconnect();
    }
  },
};
