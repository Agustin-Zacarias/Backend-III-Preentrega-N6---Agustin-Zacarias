import { describe, it } from "mocha";
import { expect } from "chai";
import request from "supertest";
import app from "../src/app.js";
import { expectError } from "./helpers.js";

describe("Errores HTTP", function () {
  it("una ruta inexistente responde ROUTE_NOT_FOUND", async function () {
    const response = await request(app).get("/api/no-existe");
    expectError(expect, response, 404, "ROUTE_NOT_FOUND");
  });

  it("un ID mal formado responde INVALID_ID", async function () {
    const response = await request(app).get("/api/users/no-es-un-id");
    expectError(expect, response, 400, "INVALID_ID");
  });

  it("un producto incompleto responde VALIDATION_ERROR", async function () {
    const response = await request(app).post("/api/products").send({});
    expectError(expect, response, 400, "VALIDATION_ERROR");
  });
});
