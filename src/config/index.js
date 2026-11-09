import dotenv from "dotenv";
import logger from "../logger/logger.js";

dotenv.config();

const failConfiguration = (message) => {
  logger.fatal(message);
  throw new Error(message);
};

const requiredVariables = ["PORT", "MONGODB_URI", "NODE_ENV"];
const missingVariables = requiredVariables.filter(
  (variable) => !process.env[variable]?.trim(),
);

if (missingVariables.length > 0) {
  failConfiguration(
    `Configuración inválida: faltan las variables obligatorias ${missingVariables.join(", ")}. ` +
      "Completá el archivo .env a partir de .env.example.",
  );
}

const port = Number(process.env.PORT);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  failConfiguration("Configuración inválida: PORT debe ser un entero entre 1 y 65535.");
}

const nodeEnv = process.env.NODE_ENV.trim();
const allowedEnvironments = ["development", "test", "production"];
if (!allowedEnvironments.includes(nodeEnv)) {
  failConfiguration(
    `Configuración inválida: NODE_ENV debe ser ${allowedEnvironments.join(", ")}.`,
  );
}

const mongoDbUri = process.env.MONGODB_URI.trim();
if (!/^mongodb(\+srv)?:\/\//i.test(mongoDbUri)) {
  failConfiguration("Configuración inválida: MONGODB_URI debe ser una URI válida de MongoDB.");
}

export const config = Object.freeze({
  port,
  mongoDbUri,
  nodeEnv,
});
