import { asyncHandler } from "../middlewares/async-handler.js";
import logger, { LOG_LEVELS } from "../logger/logger.js";

export const testLogger = asyncHandler(async (req, res) => {
  const context = { source: "GET /api/logger-test" };

  logger.debug("Prueba de logger: nivel debug", context);
  logger.http("Prueba de logger: nivel http", context);
  logger.info("Prueba de logger: nivel info", context);
  logger.warning("Prueba de logger: nivel warning", context);
  logger.error("Prueba de logger: nivel error", context);
  logger.fatal("Prueba de logger: nivel fatal", context);

  return res.status(200).json({
    status: "success",
    message: "Se generaron registros de prueba en los niveles configurados.",
    levels: Object.keys(LOG_LEVELS).sort(
      (first, second) => LOG_LEVELS[second] - LOG_LEVELS[first],
    ),
  });
});
