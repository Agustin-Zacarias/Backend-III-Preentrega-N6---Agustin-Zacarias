import mongoose from "mongoose";
import logger from "../logger/logger.js";
import {
  AppError,
  DatabaseError,
  DuplicateEmailError,
  DuplicateResourceError,
  InternalServerError,
  InvalidIdentifierError,
  InvalidJsonError,
  InvalidStateError,
  RouteNotFoundError,
  ValidationError,
} from "../errors/app-error.js";

// Convierte errores de Mongoose/Express y errores inesperados a errores del dominio.
export const normalizeError = (error) => {
  if (error instanceof AppError) return error;

  if (error instanceof mongoose.Error.ValidationError) {
    const invalidStatus = error.errors?.status;
    if (invalidStatus?.kind === "enum") {
      return new InvalidStateError(invalidStatus.value);
    }

    const fields = Object.keys(error.errors ?? {});
    return new ValidationError(
      "Los datos no cumplen las validaciones del modelo.",
      fields.length ? { fields } : undefined,
    );
  }

  if (error instanceof mongoose.Error.CastError || error?.name === "CastError") {
    return new InvalidIdentifierError(error.path ?? "recurso");
  }

  if (error?.code === 11000) {
    if (error.keyPattern?.email || error.keyValue?.email) {
      return new DuplicateEmailError();
    }
    return new DuplicateResourceError();
  }

  if (error instanceof SyntaxError && (error.status === 400 || "body" in error)) {
    return new InvalidJsonError();
  }

  if (
    error?.name?.startsWith("Mongo") ||
    error?.name?.includes("MongooseServerSelection") ||
    error?.name === "MongoNetworkError"
  ) {
    return new DatabaseError(error);
  }

  return new InternalServerError(error);
};

export const notFoundHandler = (req, res, next) => {
  next(new RouteNotFoundError(req.method, req.originalUrl));
};

// Único punto de la aplicación que construye respuestas HTTP de error.
export const errorHandler = (error, req, res, next) => {
  if (res.headersSent) return next(error);

  const appError = normalizeError(error);
  const logContext = {
    method: req.method,
    path: `${req.baseUrl}${req.path}`,
    statusCode: appError.statusCode,
    code: appError.code,
    errorName: appError.cause?.name ?? error?.name,
  };

  if (appError.statusCode >= 500) {
    logger.error("Error al procesar una solicitud HTTP.", {
      ...logContext,
      cause: appError.cause?.message ?? error?.message,
      stack: appError.cause?.stack ?? error?.stack,
    });
  } else {
    logger.warning("Solicitud HTTP rechazada.", logContext);
  }

  const errorPayload = {
    code: appError.code,
    message: appError.message,
  };

  if (appError.details !== undefined) {
    errorPayload.details = appError.details;
  }

  return res.status(appError.statusCode).json({
    status: "error",
    error: errorPayload,
  });
};
