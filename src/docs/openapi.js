const errorResponse = (description, code, message) => ({
  description,
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/ErrorResponse" },
      example: {
        status: "error",
        error: { code, message },
      },
    },
  },
});

const successResponse = (description, example) => ({
  description,
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/SuccessResponse" },
      example,
    },
  },
});

const rawArrayResponse = (description, itemSchema, example) => ({
  description,
  content: {
    "application/json": {
      schema: {
        type: "array",
        items: { $ref: `#/components/schemas/${itemSchema}` },
      },
      example,
    },
  },
});

const mockQuantityParameter = {
  name: "qty",
  in: "query",
  required: false,
  description: "Cantidad de registros ficticios. Debe ser un entero entre 1 y 100.",
  schema: { type: "integer", minimum: 1, maximum: 100, default: 1 },
};

const errorRefs = {
  validation: { $ref: "#/components/responses/ValidationError" },
  invalidJson: { $ref: "#/components/responses/InvalidJson" },
  invalidId: { $ref: "#/components/responses/InvalidId" },
  invalidState: { $ref: "#/components/responses/InvalidState" },
  invalidMockQuantity: { $ref: "#/components/responses/InvalidMockQuantity" },
  invalidMockEntity: { $ref: "#/components/responses/InvalidMockEntity" },
  userNotFound: { $ref: "#/components/responses/UserNotFound" },
  productNotFound: { $ref: "#/components/responses/ProductNotFound" },
  orderNotFound: { $ref: "#/components/responses/OrderNotFound" },
  deliveryNotFound: { $ref: "#/components/responses/DeliveryNotFound" },
  routeNotFound: { $ref: "#/components/responses/RouteNotFound" },
  duplicateEmail: { $ref: "#/components/responses/DuplicateEmail" },
  duplicateResource: { $ref: "#/components/responses/DuplicateResource" },
  databaseError: { $ref: "#/components/responses/DatabaseError" },
  serverError: { $ref: "#/components/responses/ServerError" },
  mockSeedFailed: { $ref: "#/components/responses/MockSeedFailed" },
  internalServerError: { $ref: "#/components/responses/InternalServerError" },
};

const objectIdParameter = (name, description) => ({
  name,
  in: "path",
  required: true,
  description,
  schema: { type: "string", pattern: "^[a-fA-F0-9]{24}$", example: "507f1f77bcf86cd799439011" },
});

const userExample = {
  _id: "672000000000000000000001",
  firstName: "Ana",
  lastName: "Pérez",
  email: "ana.perez@example.com",
  role: "USER",
  createdAt: "2026-11-09T12:00:00.000Z",
  updatedAt: "2026-11-09T12:00:00.000Z",
};

const productExample = {
  _id: "672000000000000000000010",
  name: "Arroz",
  description: "Paquete de arroz de 1 kg",
  price: 2290.5,
  stock: 12,
  status: "AVAILABLE",
  createdAt: "2026-11-09T12:00:00.000Z",
  updatedAt: "2026-11-09T12:00:00.000Z",
};

const orderExample = {
  _id: "672000000000000000000020",
  user: "672000000000000000000001",
  items: [{ productName: "Arroz", quantity: 2, unitPrice: 2290.5 }],
  total: 4581,
  shippingAddress: {
    street: "Av. Maipú 1234",
    city: "San Isidro",
    province: "Buenos Aires",
    postalCode: "1642",
  },
  status: "READY_FOR_DELIVERY",
  priority: "NORMAL",
  createdAt: "2026-11-09T12:00:00.000Z",
  updatedAt: "2026-11-09T12:00:00.000Z",
};

const deliveryExample = {
  _id: "672000000000000000000030",
  order: "672000000000000000000020",
  driver: "672000000000000000000002",
  status: "ASSIGNED",
  assignedAt: "2026-11-09T12:05:00.000Z",
  deliveredAt: null,
  createdAt: "2026-11-09T12:05:00.000Z",
  updatedAt: "2026-11-09T12:05:00.000Z",
};

const successEnvelope = (payload) => ({ status: "success", payload });

const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "ShipNow API",
    version: "6.0.0",
    description:
      "API REST académica para la gestión de usuarios y productos. Incluye generación de datos mock, manejo centralizado de errores y un endpoint de validación del logger. Los pedidos cuentan con endpoints de consulta, creación y actualización de estado; las entregas se exponen mediante endpoints de mocking.",
    contact: { name: "Proyecto académico - Coderhouse" },
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Servidor local de desarrollo",
    },
  ],
  tags: [
    { name: "Users", description: "Consulta y administración de usuarios. Incluye generación mock de usuarios y repartidores." },
    { name: "Orders", description: "Consulta, creación y actualización de estado de pedidos." },
    { name: "Deliveries", description: "Generación de entregas ficticias. No hay CRUD de entregas disponible en esta versión." },
    { name: "Mocks", description: "Generación en memoria y carga controlada de datos de prueba." },
    { name: "Logger", description: "Herramientas internas para validar los niveles de logging." },
    { name: "Products", description: "Consulta y administración de productos." },
  ],
  paths: {
    "/api/users": {
      get: {
        tags: ["Users"],
        summary: "Listar usuarios",
        description: "Devuelve todos los usuarios. La contraseña no se incluye en la respuesta.",
        responses: {
          200: successResponse("Usuarios obtenidos correctamente.", successEnvelope([userExample])),
          500: errorRefs.serverError,
        },
      },
      post: {
        tags: ["Users"],
        summary: "Crear usuario",
        description: "Crea un usuario. Si no se envía role, el modelo asigna USER.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UserInput" },
              example: {
                firstName: "Ana",
                lastName: "Pérez",
                email: "ana.perez@example.com",
                password: "PasswordDePrueba123",
                role: "USER",
              },
            },
          },
        },
        responses: {
          201: successResponse("Usuario creado correctamente.", successEnvelope(userExample)),
          400: { $ref: "#/components/responses/InvalidRequestBody" },
          409: errorRefs.duplicateEmail,
          500: errorRefs.serverError,
        },
      },
    },
    "/api/users/{uid}": {
      parameters: [objectIdParameter("uid", "Identificador del usuario (MongoDB ObjectId).")],
      get: {
        tags: ["Users"],
        summary: "Obtener usuario por ID",
        description: "Busca un usuario por su identificador.",
        responses: {
          200: successResponse("Usuario obtenido correctamente.", successEnvelope(userExample)),
          400: errorRefs.invalidId,
          404: errorRefs.userNotFound,
          500: errorRefs.serverError,
        },
      },
      put: {
        tags: ["Users"],
        summary: "Actualizar usuario",
        description: "Actualiza parcialmente los campos enviados. Todos los campos del body son opcionales.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UserUpdate" },
              example: { firstName: "Ana María" },
            },
          },
        },
        responses: {
          200: successResponse("Usuario actualizado correctamente.", successEnvelope(userExample)),
          400: { $ref: "#/components/responses/InvalidIdOrRequestBody" },
          404: errorRefs.userNotFound,
          409: errorRefs.duplicateEmail,
          500: errorRefs.serverError,
        },
      },
      delete: {
        tags: ["Users"],
        summary: "Eliminar usuario",
        description: "Elimina un usuario y devuelve sus datos públicos.",
        responses: {
          200: successResponse("Usuario eliminado correctamente.", successEnvelope(userExample)),
          400: errorRefs.invalidId,
          404: errorRefs.userNotFound,
          500: errorRefs.serverError,
        },
      },
    },
    "/api/orders": {
      get: {
        tags: ["Orders"],
        summary: "Listar pedidos",
        responses: {
          200: successResponse("Pedidos obtenidos correctamente.", successEnvelope([orderExample])),
          500: errorRefs.serverError,
        },
      },
      post: {
        tags: ["Orders"],
        summary: "Crear pedido",
        description: "Crea un pedido asociado a un usuario existente con rol USER. El total debe coincidir con la suma de sus ítems.",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/OrderInput" }, example: {
            user: "672000000000000000000001",
            items: [{ productName: "Arroz", quantity: 2, unitPrice: 2290.5 }],
            total: 4581,
            shippingAddress: { street: "Av. Maipú 1234", city: "San Isidro", province: "Buenos Aires", postalCode: "1642" },
            priority: "NORMAL"
          } } },
        },
        responses: {
          201: successResponse("Pedido creado correctamente.", successEnvelope(orderExample)),
          400: errorRefs.validation,
          404: errorRefs.userNotFound,
          500: errorRefs.serverError,
        },
      },
    },
    "/api/orders/{oid}": {
      parameters: [objectIdParameter("oid", "Identificador del pedido (MongoDB ObjectId).")],
      get: {
        tags: ["Orders"], summary: "Obtener pedido por ID",
        responses: { 200: successResponse("Pedido obtenido correctamente.", successEnvelope(orderExample)), 400: errorRefs.invalidId, 404: errorRefs.orderNotFound, 500: errorRefs.serverError },
      },
    },
    "/api/orders/{oid}/status": {
      parameters: [objectIdParameter("oid", "Identificador del pedido (MongoDB ObjectId).")],
      patch: {
        tags: ["Orders"], summary: "Actualizar estado del pedido",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/OrderStatusUpdate" }, example: { status: "CONFIRMED" } } } },
        responses: { 200: successResponse("Estado actualizado correctamente.", successEnvelope(orderExample)), 400: errorRefs.invalidState, 404: errorRefs.orderNotFound, 500: errorRefs.serverError },
      },
    },
    "/api/products": {
      get: {
        tags: ["Products"],
        summary: "Listar productos",
        description: "Devuelve los productos registrados.",
        responses: {
          200: successResponse("Productos obtenidos correctamente.", successEnvelope([productExample])),
          500: errorRefs.serverError,
        },
      },
      post: {
        tags: ["Products"],
        summary: "Crear producto",
        description: "Crea un producto. El status se calcula automáticamente a partir del stock.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductInput" },
              example: { name: "Arroz", description: "Paquete de 1 kg", price: 2290.5, stock: 12 },
            },
          },
        },
        responses: {
          201: successResponse("Producto creado correctamente.", successEnvelope(productExample)),
          400: { $ref: "#/components/responses/InvalidRequestBody" },
          500: errorRefs.serverError,
        },
      },
    },
    "/api/products/{pid}": {
      parameters: [objectIdParameter("pid", "Identificador del producto (MongoDB ObjectId).")],
      get: {
        tags: ["Products"],
        summary: "Obtener producto por ID",
        responses: {
          200: successResponse("Producto obtenido correctamente.", successEnvelope(productExample)),
          400: errorRefs.invalidId,
          404: errorRefs.productNotFound,
          500: errorRefs.serverError,
        },
      },
      put: {
        tags: ["Products"],
        summary: "Actualizar producto",
        description: "Actualiza parcialmente el producto. El status se vuelve a calcular a partir del stock resultante.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductUpdate" },
              example: { price: 2490.5, stock: 8 },
            },
          },
        },
        responses: {
          200: successResponse("Producto actualizado correctamente.", successEnvelope(productExample)),
          400: { $ref: "#/components/responses/InvalidIdOrRequestBody" },
          404: errorRefs.productNotFound,
          500: errorRefs.serverError,
        },
      },
      delete: {
        tags: ["Products"],
        summary: "Eliminar producto",
        responses: {
          200: successResponse("Producto eliminado correctamente.", successEnvelope(productExample)),
          400: errorRefs.invalidId,
          404: errorRefs.productNotFound,
          500: errorRefs.serverError,
        },
      },
    },
    "/api/mocks/users": {
      get: {
        tags: ["Users", "Mocks"],
        summary: "Generar usuarios ficticios",
        description: "Genera usuarios con rol USER en memoria. No realiza inserciones en MongoDB ni devuelve contraseñas.",
        parameters: [mockQuantityParameter],
        responses: {
          200: rawArrayResponse("Array de usuarios ficticios.", "User", [userExample]),
          400: errorRefs.invalidMockQuantity,
          500: errorRefs.internalServerError,
        },
      },
    },
    "/api/mocks/drivers": {
      get: {
        tags: ["Users", "Mocks"],
        summary: "Generar repartidores ficticios",
        description: "Genera usuarios con rol DRIVER en memoria. No realiza inserciones en MongoDB.",
        parameters: [mockQuantityParameter],
        responses: {
          200: rawArrayResponse("Array de repartidores ficticios (documentos User con rol DRIVER).", "User", [{ ...userExample, role: "DRIVER" }]),
          400: errorRefs.invalidMockQuantity,
          500: errorRefs.internalServerError,
        },
      },
    },
    "/api/mocks/orders": {
      get: {
        tags: ["Orders", "Mocks"],
        summary: "Generar pedidos ficticios",
        description: "Genera pedidos y referencias a usuarios generados internamente para esa respuesta. Los datos quedan en memoria y no se guardan en MongoDB.",
        parameters: [mockQuantityParameter],
        responses: {
          200: rawArrayResponse("Array de pedidos ficticios.", "Order", [orderExample]),
          400: errorRefs.invalidMockQuantity,
          500: errorRefs.internalServerError,
        },
      },
    },
    "/api/mocks/deliveries": {
      get: {
        tags: ["Deliveries", "Mocks"],
        summary: "Generar entregas ficticias",
        description: "Genera entregas relacionadas con pedidos y repartidores creados para esa respuesta. Los datos quedan en memoria y no se guardan en MongoDB.",
        parameters: [mockQuantityParameter],
        responses: {
          200: rawArrayResponse("Array de entregas ficticias.", "Delivery", [deliveryExample]),
          400: errorRefs.invalidMockQuantity,
          500: errorRefs.internalServerError,
        },
      },
    },
    "/api/mocks/all": {
      get: {
        tags: ["Mocks"],
        summary: "Generar conjunto completo de mocks",
        description: "Genera usuarios, repartidores, pedidos y entregas en memoria, manteniendo sus referencias internas. No persiste información.",
        parameters: [mockQuantityParameter],
        responses: {
          200: {
            description: "Conjunto de datos ficticios generado correctamente.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MockDataset" },
              },
            },
          },
          400: errorRefs.invalidMockQuantity,
          500: errorRefs.internalServerError,
        },
      },
    },
    "/api/mocks/seed": {
      post: {
        tags: ["Mocks"],
        summary: "Insertar datos ficticios en MongoDB",
        description: "Carga datos de prueba. No utiliza body JSON: recibe qty y entity como query parameters. Por defecto entity=users; con entity=all inserta usuarios, repartidores, pedidos y entregas relacionados.",
        parameters: [
          mockQuantityParameter,
          {
            name: "entity",
            in: "query",
            required: false,
            description: "Tipo de carga. users inserta solo usuarios; all inserta el conjunto completo.",
            schema: { type: "string", enum: ["users", "all"], default: "users" },
          },
        ],
        responses: {
          201: {
            description: "Datos de prueba insertados correctamente.",
            content: {
              "application/json": {
                schema: {
                  oneOf: [
                    { $ref: "#/components/schemas/SeedUsersResponse" },
                    { $ref: "#/components/schemas/SeedAllResponse" },
                  ],
                },
                examples: {
                  users: { value: { insertados: 2, coleccion: "usuarios" } },
                  all: {
                    value: {
                      insertados: 8,
                      colecciones: { usuarios: 2, repartidores: 2, pedidos: 2, entregas: 2 },
                    },
                  },
                },
              },
            },
          },
          400: { $ref: "#/components/responses/InvalidMockSeedParameters" },
          500: errorRefs.mockSeedFailed,
        },
      },
    },
    "/api/logger-test": {
      get: {
        tags: ["Logger"],
        summary: "Probar los niveles de logging",
        description: "Herramienta interna de validación. Genera un mensaje en cada nivel configurado (debug, http, info, warning, error y fatal). No realiza operaciones de negocio.",
        responses: {
          200: {
            description: "Se generaron registros de prueba en todos los niveles.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoggerTestResponse" },
                example: {
                  status: "success",
                  message: "Se generaron registros de prueba en los niveles configurados.",
                  levels: ["debug", "http", "info", "warning", "error", "fatal"],
                },
              },
            },
          },
          500: errorRefs.internalServerError,
        },
      },
    },
  },
  components: {
    schemas: {
      User: {
        type: "object",
        description: "Representación pública de un usuario. No incluye password.",
        required: ["_id", "firstName", "lastName", "email", "role", "createdAt", "updatedAt"],
        properties: {
          _id: { type: "string", pattern: "^[a-fA-F0-9]{24}$", example: userExample._id },
          firstName: { type: "string", example: "Ana" },
          lastName: { type: "string", example: "Pérez" },
          email: { type: "string", format: "email", example: "ana.perez@example.com" },
          role: { type: "string", enum: ["ADMIN", "USER", "DRIVER"], example: "USER" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      UserInput: {
        type: "object",
        required: ["firstName", "lastName", "email", "password"],
        properties: {
          firstName: { type: "string", minLength: 1, example: "Ana" },
          lastName: { type: "string", minLength: 1, example: "Pérez" },
          email: { type: "string", format: "email", example: "ana.perez@example.com" },
          password: { type: "string", minLength: 1, writeOnly: true, example: "PasswordDePrueba123" },
          role: { type: "string", enum: ["ADMIN", "USER", "DRIVER"], default: "USER" },
        },
      },
      UserUpdate: {
        type: "object",
        properties: {
          firstName: { type: "string", minLength: 1 },
          lastName: { type: "string", minLength: 1 },
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 1, writeOnly: true },
          role: { type: "string", enum: ["ADMIN", "USER", "DRIVER"] },
        },
      },
      Product: {
        type: "object",
        required: ["_id", "name", "description", "price", "stock", "status", "createdAt", "updatedAt"],
        properties: {
          _id: { type: "string", pattern: "^[a-fA-F0-9]{24}$" },
          name: { type: "string", example: "Arroz" },
          description: { type: "string", example: "Paquete de arroz de 1 kg" },
          price: { type: "number", minimum: 0.01, example: 2290.5 },
          stock: { type: "integer", minimum: 0, example: 12 },
          status: { type: "string", enum: ["AVAILABLE", "OUT_OF_STOCK"] },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      ProductInput: {
        type: "object",
        required: ["name", "price", "stock"],
        properties: {
          name: { type: "string", minLength: 1 },
          description: { type: "string" },
          price: { type: "number", minimum: 0.01 },
          stock: { type: "integer", minimum: 0 },
        },
      },
      ProductUpdate: {
        type: "object",
        properties: {
          name: { type: "string", minLength: 1 },
          description: { type: "string" },
          price: { type: "number", minimum: 0.01 },
          stock: { type: "integer", minimum: 0 },
        },
      },
      OrderItem: {
        type: "object",
        required: ["productName", "quantity", "unitPrice"],
        properties: {
          productName: { type: "string", example: "Arroz" },
          quantity: { type: "integer", minimum: 1, example: 2 },
          unitPrice: { type: "number", minimum: 0.01, example: 2290.5 },
        },
      },
      ShippingAddress: {
        type: "object",
        required: ["street", "city", "province", "postalCode"],
        properties: {
          street: { type: "string", example: "Av. Maipú 1234" },
          city: { type: "string", example: "San Isidro" },
          province: { type: "string", example: "Buenos Aires" },
          postalCode: { type: "string", example: "1642" },
        },
      },
      OrderInput: {
        type: "object",
        required: ["user", "items", "total", "shippingAddress"],
        properties: {
          user: { type: "string", pattern: "^[a-fA-F0-9]{24}$" },
          items: { type: "array", minItems: 1, items: { $ref: "#/components/schemas/OrderItem" } },
          total: { type: "number", minimum: 0.01 },
          shippingAddress: { $ref: "#/components/schemas/ShippingAddress" },
          status: { type: "string", enum: ["PENDING", "CONFIRMED", "PREPARING", "READY_FOR_DELIVERY", "COMPLETED", "CANCELLED"] },
          priority: { type: "string", enum: ["LOW", "NORMAL", "HIGH", "URGENT"] },
        },
      },
      OrderStatusUpdate: {
        type: "object",
        required: ["status"],
        properties: { status: { type: "string", enum: ["PENDING", "CONFIRMED", "PREPARING", "READY_FOR_DELIVERY", "COMPLETED", "CANCELLED"] } },
      },
      Order: {
        type: "object",
        required: ["_id", "user", "items", "total", "shippingAddress", "status", "priority", "createdAt", "updatedAt"],
        properties: {
          _id: { type: "string", pattern: "^[a-fA-F0-9]{24}$" },
          user: { type: "string", description: "ObjectId de un documento User con rol USER." },
          items: { type: "array", minItems: 1, items: { $ref: "#/components/schemas/OrderItem" } },
          total: { type: "number", minimum: 0.01, example: 4581 },
          shippingAddress: { $ref: "#/components/schemas/ShippingAddress" },
          status: { type: "string", enum: ["PENDING", "CONFIRMED", "PREPARING", "READY_FOR_DELIVERY", "COMPLETED", "CANCELLED"] },
          priority: { type: "string", enum: ["LOW", "NORMAL", "HIGH", "URGENT"] },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Delivery: {
        type: "object",
        required: ["_id", "order", "driver", "status", "assignedAt", "deliveredAt", "createdAt", "updatedAt"],
        properties: {
          _id: { type: "string", pattern: "^[a-fA-F0-9]{24}$" },
          order: { type: "string", description: "ObjectId de un documento Order." },
          driver: { type: "string", description: "ObjectId de un documento User cuyo role es DRIVER." },
          status: { type: "string", enum: ["PENDING", "ASSIGNED", "IN_TRANSIT", "DELIVERED"] },
          assignedAt: { type: "string", format: "date-time", nullable: true },
          deliveredAt: { type: "string", format: "date-time", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      ErrorResponse: {
        type: "object",
        required: ["status", "error"],
        properties: {
          status: { type: "string", enum: ["error"], example: "error" },
          error: {
            type: "object",
            required: ["code", "message"],
            properties: {
              code: {
                type: "string",
                enum: [
                  "VALIDATION_ERROR", "INVALID_JSON", "INVALID_ID", "INVALID_STATE",
                  "INVALID_MOCK_QUANTITY", "INVALID_MOCK_ENTITY", "USER_NOT_FOUND",
                  "PRODUCT_NOT_FOUND", "ORDER_NOT_FOUND", "DELIVERY_NOT_FOUND", "ROUTE_NOT_FOUND",
                  "DUPLICATE_EMAIL", "DUPLICATE_RESOURCE", "MOCK_SEED_FAILED", "DATABASE_ERROR",
                  "INTERNAL_SERVER_ERROR",
                ],
              },
              message: { type: "string" },
              details: { type: "object", additionalProperties: true },
            },
          },
        },
        example: {
          status: "error",
          error: { code: "INVALID_MOCK_QUANTITY", message: "El parámetro qty debe ser un entero entre 1 y 100." },
        },
      },
      SuccessResponse: {
        type: "object",
        required: ["status"],
        properties: {
          status: { type: "string", enum: ["success"] },
          payload: { description: "Contenido devuelto por el endpoint." },
          message: { type: "string" },
          levels: { type: "array", items: { type: "string", enum: ["debug", "http", "info", "warning", "error", "fatal"] } },
        },
      },
      MockDataset: {
        type: "object",
        required: ["users", "drivers", "orders", "deliveries"],
        properties: {
          users: { type: "array", items: { $ref: "#/components/schemas/User" } },
          drivers: { type: "array", items: { $ref: "#/components/schemas/User" } },
          orders: { type: "array", items: { $ref: "#/components/schemas/Order" } },
          deliveries: { type: "array", items: { $ref: "#/components/schemas/Delivery" } },
        },
      },
      SeedUsersResponse: {
        type: "object",
        required: ["insertados", "coleccion"],
        properties: {
          insertados: { type: "integer", example: 2 },
          coleccion: { type: "string", enum: ["usuarios"] },
        },
      },
      SeedAllResponse: {
        type: "object",
        required: ["insertados", "colecciones"],
        properties: {
          insertados: { type: "integer", example: 8 },
          colecciones: {
            type: "object",
            required: ["usuarios", "repartidores", "pedidos", "entregas"],
            properties: {
              usuarios: { type: "integer", example: 2, description: "Cantidad de usuarios con rol USER insertados en la colección users." },
              repartidores: { type: "integer", example: 2, description: "Cantidad de usuarios con rol DRIVER insertados en la colección users." },
              pedidos: { type: "integer", example: 2 },
              entregas: { type: "integer", example: 2 },
            },
          },
        },
      },
      LoggerTestResponse: {
        type: "object",
        required: ["status", "message", "levels"],
        properties: {
          status: { type: "string", enum: ["success"] },
          message: { type: "string" },
          levels: { type: "array", items: { type: "string", enum: ["debug", "http", "info", "warning", "error", "fatal"] } },
        },
      },
    },
    responses: {
      ValidationError: errorResponse("Los datos enviados no cumplen las validaciones.", "VALIDATION_ERROR", "Los datos enviados no son válidos."),
      InvalidRequestBody: {
        description: "El body está malformado o no cumple las validaciones del recurso.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
            examples: {
              invalidJson: { value: { status: "error", error: { code: "INVALID_JSON", message: "El cuerpo de la solicitud contiene JSON inválido." } } },
              validation: { value: { status: "error", error: { code: "VALIDATION_ERROR", message: "Los datos enviados no son válidos." } } },
            },
          },
        },
      },
      InvalidIdOrRequestBody: {
        description: "El identificador no es válido o el body está malformado/no cumple las validaciones.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
            examples: {
              invalidId: { value: { status: "error", error: { code: "INVALID_ID", message: "El identificador enviado no tiene un formato válido." } } },
              invalidJson: { value: { status: "error", error: { code: "INVALID_JSON", message: "El cuerpo de la solicitud contiene JSON inválido." } } },
              validation: { value: { status: "error", error: { code: "VALIDATION_ERROR", message: "Los datos enviados no son válidos." } } },
            },
          },
        },
      },
      InvalidMockSeedParameters: {
        description: "La cantidad o el tipo de entidad indicado no es válido.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
            examples: {
              quantity: { value: { status: "error", error: { code: "INVALID_MOCK_QUANTITY", message: "El parámetro qty debe ser un entero entre 1 y 100." } } },
              entity: { value: { status: "error", error: { code: "INVALID_MOCK_ENTITY", message: "El parámetro entity debe ser 'users' o 'all'." } } },
            },
          },
        },
      },
      InvalidJson: errorResponse("El body contiene JSON malformado.", "INVALID_JSON", "El cuerpo de la solicitud contiene JSON inválido."),
      InvalidId: errorResponse("El identificador no tiene formato ObjectId válido.", "INVALID_ID", "El identificador enviado no tiene un formato válido."),
      InvalidState: errorResponse("El estado no pertenece a los valores permitidos por el modelo.", "INVALID_STATE", "El estado indicado no es válido."),
      InvalidMockQuantity: errorResponse("qty no es un entero entre 1 y 100.", "INVALID_MOCK_QUANTITY", "El parámetro qty debe ser un entero entre 1 y 100."),
      InvalidMockEntity: errorResponse("entity no es uno de los valores admitidos.", "INVALID_MOCK_ENTITY", "El parámetro entity debe ser 'users' o 'all'."),
      UserNotFound: errorResponse("No existe el usuario solicitado.", "USER_NOT_FOUND", "Usuario no encontrado."),
      ProductNotFound: errorResponse("No existe el producto solicitado.", "PRODUCT_NOT_FOUND", "Producto no encontrado."),
      OrderNotFound: errorResponse("No existe el pedido solicitado.", "ORDER_NOT_FOUND", "Pedido no encontrado."),
      DeliveryNotFound: errorResponse("No existe la entrega solicitada.", "DELIVERY_NOT_FOUND", "Entrega no encontrada."),
      RouteNotFound: errorResponse("La ruta y el método no están registrados.", "ROUTE_NOT_FOUND", "La ruta solicitada no existe."),
      DuplicateEmail: errorResponse("El email ya está registrado.", "DUPLICATE_EMAIL", "Ya existe un usuario con ese email."),
      DuplicateResource: errorResponse("El recurso ya existe.", "DUPLICATE_RESOURCE", "El recurso ya existe."),
      DatabaseError: errorResponse("La operación de base de datos no pudo completarse.", "DATABASE_ERROR", "No fue posible completar la operación en la base de datos."),
      ServerError: {
        description: "Error interno o falla de acceso a la base de datos.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
            examples: {
              database: { value: { status: "error", error: { code: "DATABASE_ERROR", message: "No fue posible completar la operación en la base de datos." } } },
              internal: { value: { status: "error", error: { code: "INTERNAL_SERVER_ERROR", message: "Ocurrió un error interno del servidor." } } },
            },
          },
        },
      },
      MockSeedFailed: errorResponse("No se pudo completar la carga de datos de prueba.", "MOCK_SEED_FAILED", "No se pudieron guardar los datos de prueba en MongoDB."),
      InternalServerError: errorResponse("Error interno no esperado.", "INTERNAL_SERVER_ERROR", "Ocurrió un error interno del servidor."),
    },
  },
};

export default openApiDocument;
