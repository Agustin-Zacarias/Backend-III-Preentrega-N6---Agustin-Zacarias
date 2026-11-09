import logger from "../logger/logger.js";

// Registra cada solicitud una vez finalizada, incluyendo método, ruta,
// código HTTP y duración. No registra bodies ni datos sensibles.
export const requestLogger = (req, res, next) => {
  const startedAt = process.hrtime.bigint();

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    logger.http("Solicitud HTTP completada", {
      method: req.method,
      path: `${req.baseUrl}${req.path}`,
      statusCode: res.statusCode,
      durationMs: Number(durationMs.toFixed(2)),
    });
  });

  next();
};
