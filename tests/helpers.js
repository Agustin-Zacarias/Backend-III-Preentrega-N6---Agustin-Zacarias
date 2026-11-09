export const validUser = (overrides = {}) => ({
  firstName: "Agustín",
  lastName: "Prueba",
  email: `test.${Date.now()}.${Math.random().toString(16).slice(2)}@shipnow.test`,
  password: "TestPassword123",
  role: "USER",
  ...overrides,
});

export const validOrder = (userId, overrides = {}) => ({
  user: userId,
  items: [{ productName: "Producto de prueba", quantity: 2, unitPrice: 150 }],
  total: 300,
  shippingAddress: {
    street: "Calle de prueba 123",
    city: "Tigre",
    province: "Buenos Aires",
    postalCode: "1648",
  },
  ...overrides,
});

export const expectError = (expect, response, status, code) => {
  expect(response.status).to.equal(status);
  expect(response.body).to.have.property("status", "error");
  expect(response.body).to.have.nested.property("error.code", code);
  expect(response.body.error.message).to.be.a("string").and.not.empty;
};
