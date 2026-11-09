import express from "express";
import usersRouter from "./routes/users.router.js";
import productsRouter from "./routes/products.router.js";
import ordersRouter from "./routes/orders.router.js";
import mocksRouter from "./routes/mocks.router.js";
import loggerRouter from "./routes/logger.router.js";
import { requestLogger } from "./middlewares/request-logger.js";
import { errorHandler, notFoundHandler } from "./middlewares/error-handler.js";
import { registerSwagger } from "./config/swagger.js";

const app = express();

app.use(requestLogger);
app.use(express.json());

// Documentación OpenAPI/Swagger, configurada fuera de los routers de negocio.
registerSwagger(app);
app.use("/api/users", usersRouter);
app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/mocks", mocksRouter);
app.use("/api/logger-test", loggerRouter);

// Las rutas inexistentes también se convierten en errores del dominio.
app.use(notFoundHandler);

// Debe permanecer al final: centraliza todas las respuestas HTTP de error.
app.use(errorHandler);

export default app;
