// Diccionario central de errores: define el código HTTP y el mensaje por defecto.
export const ERROR_DICTIONARY = Object.freeze({
  VALIDATION_ERROR: {
    statusCode: 400,
    message: "Los datos enviados no son válidos.",
  },
  INVALID_JSON: {
    statusCode: 400,
    message: "El cuerpo de la solicitud contiene JSON inválido.",
  },
  INVALID_ID: {
    statusCode: 400,
    message: "El identificador enviado no tiene un formato válido.",
  },
  INVALID_STATE: {
    statusCode: 400,
    message: "El estado indicado no es válido.",
  },
  INVALID_MOCK_QUANTITY: {
    statusCode: 400,
    message: "El parámetro qty debe ser un entero entre 1 y 100.",
  },
  INVALID_MOCK_ENTITY: {
    statusCode: 400,
    message: "El parámetro entity debe ser 'users' o 'all'.",
  },
  USER_NOT_FOUND: {
    statusCode: 404,
    message: "Usuario no encontrado.",
  },
  PRODUCT_NOT_FOUND: {
    statusCode: 404,
    message: "Producto no encontrado.",
  },
  ORDER_NOT_FOUND: {
    statusCode: 404,
    message: "Pedido no encontrado.",
  },
  DELIVERY_NOT_FOUND: {
    statusCode: 404,
    message: "Entrega no encontrada.",
  },
  ROUTE_NOT_FOUND: {
    statusCode: 404,
    message: "La ruta solicitada no existe.",
  },
  DUPLICATE_EMAIL: {
    statusCode: 409,
    message: "Ya existe un usuario con ese email.",
  },
  DUPLICATE_RESOURCE: {
    statusCode: 409,
    message: "El recurso ya existe.",
  },
  MOCK_SEED_FAILED: {
    statusCode: 500,
    message: "No se pudieron guardar los datos de prueba en MongoDB.",
  },
  DATABASE_ERROR: {
    statusCode: 500,
    message: "No fue posible completar la operación en la base de datos.",
  },
  INTERNAL_SERVER_ERROR: {
    statusCode: 500,
    message: "Ocurrió un error interno del servidor.",
  },
});
