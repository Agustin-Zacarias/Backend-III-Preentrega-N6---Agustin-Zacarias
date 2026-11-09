import app from "./app.js";
import connectDB from "./config/db.js";
import { config } from "./config/index.js";
import logger from "./logger/logger.js";

const startServer = async () => {
  logger.debug("Iniciando ShipNow API", { environment: config.nodeEnv });

  try {
    await connectDB();
    const server = app.listen(config.port, () => {
      logger.info(`Servidor ShipNow escuchando en el puerto ${config.port}.`);
    });

    server.on("error", (error) => {
      logger.fatal("El servidor HTTP sufrió un error crítico.", {
        error: error.message,
        stack: error.stack,
      });
      process.exitCode = 1;
    });
  } catch (error) {
    logger.fatal("No se pudo iniciar ShipNow.", {
      error: error.message,
      stack: error.stack,
    });
    process.exitCode = 1;
  }
};

startServer();
