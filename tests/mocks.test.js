import { describe, it } from "mocha";
import { expect } from "chai";
import request from "supertest";
import app from "../src/app.js";
import UserModel from "../src/models/user.model.js";
import OrderModel from "../src/models/order.model.js";
import DeliveryModel from "../src/models/delivery.model.js";
import { expectError } from "./helpers.js";

describe("Mocks API", function () {
  it("GET /api/mocks/users genera usuarios ficticios sin password", async function () {
    const response = await request(app).get("/api/mocks/users?qty=2").expect(200);
    expect(response.body).to.have.length(2);
    expect(response.body[0]).to.include.keys("_id", "firstName", "lastName", "email", "role");
    expect(response.body[0].role).to.equal("USER");
    expect(response.body[0]).not.to.have.property("password");
  });

  it("GET /api/mocks/drivers genera usuarios con rol DRIVER", async function () {
    const response = await request(app).get("/api/mocks/drivers?qty=2").expect(200);
    expect(response.body).to.have.length(2);
    expect(response.body.every((driver) => driver.role === "DRIVER")).to.equal(true);
    expect(response.body[0]).not.to.have.property("password");
  });

  it("GET /api/mocks/orders genera pedidos con referencia de usuario", async function () {
    const response = await request(app).get("/api/mocks/orders?qty=2").expect(200);
    expect(response.body).to.have.length(2);
    expect(response.body[0]).to.include.keys("_id", "user", "items", "total", "shippingAddress", "status", "priority");
    expect(response.body[0].items).to.be.an("array").that.is.not.empty;
  });

  it("GET /api/mocks/deliveries genera entregas con referencias", async function () {
    const response = await request(app).get("/api/mocks/deliveries?qty=2").expect(200);
    expect(response.body).to.have.length(2);
    expect(response.body[0]).to.include.keys("_id", "order", "driver", "status", "assignedAt", "deliveredAt");
  });

  it("GET /api/mocks/all genera referencias coherentes", async function () {
    const response = await request(app).get("/api/mocks/all?qty=2").expect(200);
    const data = response.body;
    expect(data.users).to.have.length(2);
    expect(data.drivers).to.have.length(2);
    expect(data.orders).to.have.length(2);
    expect(data.deliveries).to.have.length(2);
    const userIds = new Set(data.users.map((user) => user._id));
    const driverIds = new Set(data.drivers.map((driver) => driver._id));
    const orderIds = new Set(data.orders.map((order) => order._id));
    expect(data.orders.every((order) => userIds.has(order.user))).to.equal(true);
    expect(data.deliveries.every((delivery) => orderIds.has(delivery.order))).to.equal(true);
    expect(data.deliveries.every((delivery) => driverIds.has(delivery.driver))).to.equal(true);
  });

  it("POST /api/mocks/seed persiste un dataset relacionado y devuelve contadores", async function () {
    const response = await request(app).post("/api/mocks/seed?qty=1&entity=all").expect(201);
    expect(response.body.insertados).to.equal(4);
    expect(response.body.colecciones).to.deep.equal({ usuarios: 1, repartidores: 1, pedidos: 1, entregas: 1 });
    expect(await UserModel.countDocuments({})).to.equal(2);
    expect(await OrderModel.countDocuments({})).to.equal(1);
    expect(await DeliveryModel.countDocuments({})).to.equal(1);
  });

  it("POST /api/mocks/seed inserta usuarios cuando entity se omite", async function () {
    const response = await request(app).post("/api/mocks/seed?qty=2").expect(201);
    expect(response.body).to.deep.equal({ insertados: 2, coleccion: "usuarios" });
    expect(await UserModel.countDocuments({ role: "USER" })).to.equal(2);
  });

  it("GET /api/mocks/users rechaza cantidades inválidas", async function () {
    const response = await request(app).get("/api/mocks/users?qty=-1");
    expectError(expect, response, 400, "INVALID_MOCK_QUANTITY");
  });

  it("POST /api/mocks/seed rechaza entity inválido", async function () {
    const response = await request(app).post("/api/mocks/seed?qty=1&entity=orders");
    expectError(expect, response, 400, "INVALID_MOCK_ENTITY");
  });
});
