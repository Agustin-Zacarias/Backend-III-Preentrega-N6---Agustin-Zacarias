import mongoose from "mongoose";
import { config } from "./index.js";
import logger from "../logger/logger.js";

// Este módulo abre la conexión. Las consultas de las entidades se realizan
// exclusivamente desde sus respectivos repositories.
const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoDbUri);
    logger.info("Conexión a MongoDB establecida.");
  } catch (error) {
    logger.error("Falló la conexión inicial a MongoDB.", {
      error: error.message,
      name: error.name,
    });
    throw error;
  }
};

export default connectDB;
