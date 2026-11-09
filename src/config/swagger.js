import swaggerUi from "swagger-ui-express";
import openApiDocument from "../docs/openapi.js";

const swaggerOptions = {
  explorer: true,
  customSiteTitle: "ShipNow API - Documentación",
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
  },
};

export const registerSwagger = (app) => {
  // También se expone el documento OpenAPI en JSON para validaciones y herramientas externas.
  app.get("/api/docs/openapi.json", (_req, res) => {
    res.status(200).json(openApiDocument);
  });

  app.use(
    "/api/docs",
    swaggerUi.serve,
    swaggerUi.setup(openApiDocument, swaggerOptions),
  );
};

export default openApiDocument;
