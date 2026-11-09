import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { inspect } from "node:util";
import winston from "winston";

// Orden de menor a mayor severidad para los niveles personalizados de Winston.
export const LOG_LEVELS = Object.freeze({
  fatal: 0,
  error: 1,
  warning: 2,
  info: 3,
  http: 4,
  debug: 5,
});

winston.addColors({
  fatal: "magenta",
  error: "red",
  warning: "yellow",
  info: "green",
  http: "cyan",
  debug: "gray",
});

const environment = process.env.NODE_ENV?.trim() || "development";
const isTestEnvironment = environment === "test" || Boolean(process.env.NODE_TEST_CONTEXT);
const defaultLevel = environment === "production" ? "info" : "debug";
const activeLevel = process.env.LOG_LEVEL?.trim() || defaultLevel;
const logsDirectory = path.resolve(process.cwd(), "logs");

if (!isTestEnvironment) {
  fs.mkdirSync(logsDirectory, { recursive: true });
}

const timestamp = winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" });
const errorsWithStack = winston.format.errors({ stack: true });
const splat = winston.format.splat();

const printLine = winston.format.printf((info) => {
  const { timestamp: time, level, message, stack, ...metadata } = info;
  const context = Object.keys(metadata).length
    ? ` ${inspect(metadata, { depth: 3, colors: false, breakLength: Infinity })}`
    : "";
  const outputMessage = stack ? `${message}\n${stack}` : message;
  return `${time} [${level}] ${outputMessage}${context}`;
});

const logger = winston.createLogger({
  levels: LOG_LEVELS,
  level: activeLevel,
  silent: isTestEnvironment,
  transports: [
    new winston.transports.Console({
      level: activeLevel,
      format: winston.format.combine(
        winston.format.colorize({ level: true }),
        timestamp,
        errorsWithStack,
        splat,
        printLine,
      ),
    }),
  ],
  exitOnError: false,
});

if (!isTestEnvironment) {
  const errorFileTransport = new winston.transports.File({
    filename: path.join(logsDirectory, "error.log"),
    level: "error", // Incluye error y fatal; excluye warning, info, http y debug.
    maxsize: 5 * 1024 * 1024,
    maxFiles: 14,
    tailable: true,
    format: winston.format.combine(timestamp, errorsWithStack, splat, printLine),
  });

  errorFileTransport.on("error", (error) => {
    process.stderr.write(`No se pudo escribir el archivo de logs: ${error.message}\n`);
  });

  logger.add(errorFileTransport);
}

export default logger;
