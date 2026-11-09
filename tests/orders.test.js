import { describe, it } from "mocha";
import { expect } from "chai";
import request from "supertest";
import app from "../src/app.js";
import { ORDER_STATUS } from "../src/constants/index.js";
import { validUser, validOrder, expectError } from "./helpers.js";

const createUser = async () => {
  const response = await request(app).post("/api/users").send(validUser()).expect(201);
  return response.body.payload._id;
};

describe("Orders API", function () {
  it("GET /api/orders devuelve un listado", async function () {
    const response = await request(app).get("/api/orders").expect(200);
    expect(response.body.status).to.equal("success");
    expect(response.body.payload).to.be.an("array");
  });

  it("POST /api/orders crea un pedido asociado a un usuario existente", async function () {
    const userId = await createUser();
    const response = await request(app).post("/api/orders").send(validOrder(userId)).expect(201);
    expect(response.body.status).to.equal("success");
    expect(response.body.payload).to.include.keys("_id", "user", "items", "total", "shippingAddress", "status", "priority");
    expect(response.body.payload.user).to.equal(userId);
    expect(response.body.payload.total).to.equal(300);
    expect(response.body.payload.status).to.equal(ORDER_STATUS.PENDING);
  });

  it("POST /api/orders rechaza un pedido incompleto", async function () {
    const response = await request(app).post("/api/orders").send({ items: [] });
    expectError(expect, response, 400, "VALIDATION_ERROR");
  });

  it("GET /api/orders/:oid recupera el pedido creado", async function () {
    const userId = await createUser();
    const created = await request(app).post("/api/orders").send(validOrder(userId)).expect(201);
    const response = await request(app).get(`/api/orders/${created.body.payload._id}`).expect(200);
    expect(response.body.payload._id).to.equal(created.body.payload._id);
    expect(response.body.payload.user).to.equal(userId);
  });

  it("GET /api/orders/:oid devuelve ORDER_NOT_FOUND", async function () {
    const response = await request(app).get("/api/orders/507f1f77bcf86cd799439011");
    expectError(expect, response, 404, "ORDER_NOT_FOUND");
  });

  it("PATCH /api/orders/:oid/status actualiza un estado permitido", async function () {
    const userId = await createUser();
    const created = await request(app).post("/api/orders").send(validOrder(userId)).expect(201);
    const response = await request(app)
      .patch(`/api/orders/${created.body.payload._id}/status`)
      .send({ status: ORDER_STATUS.CONFIRMED }).expect(200);
    expect(response.body.payload.status).to.equal(ORDER_STATUS.CONFIRMED);
  });

  it("PATCH /api/orders/:oid/status rechaza un estado inválido", async function () {
    const userId = await createUser();
    const created = await request(app).post("/api/orders").send(validOrder(userId)).expect(201);
    const response = await request(app)
      .patch(`/api/orders/${created.body.payload._id}/status`)
      .send({ status: "ON_THE_MOON" });
    expectError(expect, response, 400, "INVALID_STATE");
  });
});
