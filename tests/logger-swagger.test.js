import { describe, it } from "mocha";
import { expect } from "chai";
import request from "supertest";
import app from "../src/app.js";

describe("Logger y Swagger", function () {
  it("GET /api/logger-test dispara los seis niveles", async function () {
    const response = await request(app).get("/api/logger-test").expect(200);
    expect(response.body.status).to.equal("success");
    expect(response.body.levels).to.deep.equal(["debug", "http", "info", "warning", "error", "fatal"]);
  });

  it("GET /api/docs/ entrega Swagger UI", async function () {
    const response = await request(app).get("/api/docs/").expect(200);
    expect(response.headers["content-type"]).to.match(/text\/html/);
    expect(response.text).to.match(/swagger-ui/i);
  });

  it("GET /api/docs/openapi.json publica la especificación OpenAPI", async function () {
    const response = await request(app).get("/api/docs/openapi.json").expect(200);
    expect(response.body.openapi).to.equal("3.0.3");
    expect(response.body.paths).to.have.property("/api/orders");
    expect(response.body.paths["/api/orders"].post).to.exist;
    expect(response.body.components.schemas).to.have.property("Order");
  });
});
