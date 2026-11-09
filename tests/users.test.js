import { describe, it } from "mocha";
import { expect } from "chai";
import request from "supertest";
import app from "../src/app.js";
import { validUser, expectError } from "./helpers.js";

describe("Users API", function () {
  it("GET /api/users devuelve un listado con envelope público", async function () {
    const response = await request(app).get("/api/users").expect(200);
    expect(response.body).to.have.property("status", "success");
    expect(response.body.payload).to.be.an("array");
  });

  it("POST /api/users crea un usuario y no expone password", async function () {
    const response = await request(app).post("/api/users").send(validUser()).expect(201);
    expect(response.body.status).to.equal("success");
    expect(response.body.payload).to.include.keys("_id", "firstName", "lastName", "email", "role");
    expect(response.body.payload.role).to.equal("USER");
    expect(response.body.payload).not.to.have.property("password");
  });

  it("POST /api/users rechaza datos incompletos con el formato común", async function () {
    const response = await request(app).post("/api/users").send({ firstName: "Solo nombre" });
    expectError(expect, response, 400, "VALIDATION_ERROR");
  });

  it("GET /api/users/:uid devuelve el usuario creado", async function () {
    const created = await request(app).post("/api/users").send(validUser()).expect(201);
    const response = await request(app).get(`/api/users/${created.body.payload._id}`).expect(200);
    expect(response.body.payload._id).to.equal(created.body.payload._id);
    expect(response.body.payload).not.to.have.property("password");
  });

  it("GET /api/users/:uid responde 404 si el usuario no existe", async function () {
    const response = await request(app).get("/api/users/507f1f77bcf86cd799439011");
    expectError(expect, response, 404, "USER_NOT_FOUND");
  });
});
