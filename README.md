# ShipNow API

API REST desarrollada con Node.js, Express y MongoDB para la gestión de usuarios y productos. El proyecto incorpora una arquitectura por capas, un módulo de mocking y carga de datos de prueba, una capa centralizada de manejo profesional de errores, logging con Winston y documentación interactiva mediante Swagger/OpenAPI.

Proyecto correspondiente a las pre-entregas de los módulos 1, 2, 3, 4, 5 y 6 del curso **Programación Backend (III): Testing y Escalabilidad**, de Coderhouse.

## Tecnologías

- Node.js
- Express
- MongoDB Atlas
- Mongoose
- dotenv
- Winston
- swagger-ui-express
- Mocha
- Chai
- Supertest

## Instalación y configuración

1. Clonar el repositorio e ingresar a su directorio:

```bash
git clone https://github.com/Agustin-Zacarias/Backend-III-Preentrega-N6---Agustin-Zacarias
cd shipnow-api
```

2. Instalar las dependencias:

```bash
npm install
```

3. Crear el archivo `.env` en la raíz a partir de `.env.example`:

```env
PORT=3000
MONGODB_URI=TU_URI_DE_MONGODB_ATLAS
NODE_ENV=development
# Opcional: LOG_LEVEL=debug
```

Reemplazar `TU_URI_DE_MONGODB_ATLAS` por la URI propia de MongoDB Atlas. No publicar el archivo `.env` ni compartir sus credenciales.

4. Iniciar el servidor:

```bash
npm run dev
```

La aplicación se conecta a MongoDB antes de comenzar a escuchar solicitudes. Por defecto utiliza el puerto `3000`.

## Arquitectura

El proyecto mantiene la separación por capas:

```text
Request
   ↓
Routes
   ↓
Controllers
   ↓
Services
   ↓
Repositories
   ↓
Models
   ↓
MongoDB
```

Los errores se derivan al middleware global, que genera una respuesta HTTP uniforme.

- **Routes:** declaran los endpoints y delegan su ejecución a los controllers.
- **Controllers:** reciben los parámetros HTTP, llaman a los services y construyen las respuestas exitosas.
- **Services:** contienen la lógica de negocio y detectan los errores del dominio.
- **Repositories:** encapsulan las operaciones de persistencia mediante Mongoose.
- **Models:** definen los esquemas y las referencias entre documentos.
- **Middlewares:** gestionan los handlers asíncronos y centralizan las respuestas de error.

## Estructura relevante

```text
src/
├── config/
│   ├── db.js
│   ├── index.js
│   └── swagger.js
├── constants/
│   └── index.js
├── controllers/
│   ├── logger.controller.js
│   ├── mock.controller.js
│   ├── order.controller.js
│   ├── product.controller.js
│   └── user.controller.js
├── docs/
│   └── openapi.js
├── errors/
│   ├── app-error.js
│   └── error.dictionary.js
├── logger/
│   └── logger.js
├── middlewares/
│   ├── async-handler.js
│   ├── error-handler.js
│   └── request-logger.js
├── models/
│   ├── delivery.model.js
│   ├── order.model.js
│   ├── product.model.js
│   └── user.model.js
├── repositories/
│   ├── mock.repository.js
│   ├── order.repository.js
│   ├── product.repository.js
│   └── user.repository.js
├── routes/
│   ├── logger.router.js
│   ├── mocks.router.js
│   ├── orders.router.js
│   ├── products.router.js
│   └── users.router.js
├── services/
│   ├── mock.service.js
│   ├── order.service.js
│   ├── product.service.js
│   └── user.service.js
├── utils/
│   └── mock-data.factory.js
├── app.js
└── server.js

tests/
├── setup.js
├── helpers.js
├── users.test.js
├── orders.test.js
├── mocks.test.js
├── logger-swagger.test.js
└── routes-errors.test.js
```

## Endpoints de mocking

Todos los endpoints GET devuelven datos ficticios generados en memoria y no los guardan en MongoDB. El parámetro `qty` indica la cantidad de registros a generar; si se omite, se utiliza `1`. Se aceptan enteros entre `1` y `100`.

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/mocks/users?qty=2` | Genera usuarios ficticios con rol `USER`. |
| GET | `/api/mocks/drivers?qty=2` | Genera usuarios ficticios con rol `DRIVER`. |
| GET | `/api/mocks/orders?qty=2` | Genera pedidos con referencias a usuarios ficticios. |
| GET | `/api/mocks/deliveries?qty=2` | Genera entregas con referencias a pedidos y repartidores ficticios. |
| GET | `/api/mocks/all?qty=2` | Devuelve el conjunto completo con las relaciones visibles. |
| POST | `/api/mocks/seed?qty=10` | Inserta diez usuarios ficticios en MongoDB. |
| POST | `/api/mocks/seed?qty=2&entity=all` | Inserta usuarios, repartidores, pedidos y entregas relacionados. |

### Generar datos sin persistir

Ejemplo:

```http
GET http://localhost:3000/api/mocks/users?qty=2
```

La respuesta es un array de usuarios ficticios. Los valores concretos cambian en cada solicitud y la contraseña no se incluye en las respuestas públicas.

Para inspeccionar todas las entidades en un mismo conjunto:

```http
GET http://localhost:3000/api/mocks/all?qty=2
```

La respuesta contiene `users`, `drivers`, `orders` y `deliveries`. Cada pedido referencia un usuario del conjunto; cada entrega referencia un pedido y un repartidor del mismo conjunto.

### Cargar datos de prueba en MongoDB

Para insertar solamente usuarios:

```http
POST http://localhost:3000/api/mocks/seed?qty=10
```

Respuesta ilustrativa:

```json
{
  "insertados": 10,
  "coleccion": "usuarios"
}
```

Para insertar las cuatro entidades relacionadas:

```http
POST http://localhost:3000/api/mocks/seed?qty=2&entity=all
```

Con `qty=2` se insertan dos usuarios, dos repartidores, dos pedidos y dos entregas (ocho documentos en total).

Los repartidores no utilizan una colección física independiente: se almacenan en `users` como documentos con el rol `DRIVER`. Por eso, en MongoDB habrá cuatro documentos en `users` (dos `USER` y dos `DRIVER`), dos en `orders` y dos en `deliveries`.

El parámetro `entity` acepta `users` o `all`. Si se omite, se utiliza `users`. Las cantidades fuera del rango permitido y los valores de `entity` no reconocidos generan errores HTTP centralizados.

## Modelos, roles y relaciones

- **User:** utiliza `firstName`, `lastName`, `email`, `password` y `role`. Los roles permitidos se centralizan en `USER_ROLES`, incluido `DRIVER`.
- **Order:** referencia a un usuario mediante `user`, contiene los ítems, el total, la dirección de envío, el estado y la prioridad.
- **Delivery:** referencia a un pedido mediante `order` y a un usuario con rol `DRIVER` mediante `driver`.

Los valores permitidos están centralizados en `src/constants/index.js`: `USER_ROLES`, `PRODUCT_STATUS`, `ORDER_STATUS`, `ORDER_PRIORITY` y `DELIVERY_STATUS`.

## Endpoints principales

### Pedidos

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/orders` | Obtener todos los pedidos. |
| GET | `/api/orders/:oid` | Obtener un pedido por ID. |
| POST | `/api/orders` | Crear un pedido asociado a un usuario existente. |
| PATCH | `/api/orders/:oid/status` | Actualizar el estado de un pedido. |

### Usuarios

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/users` | Obtener todos los usuarios. |
| GET | `/api/users/:uid` | Obtener un usuario por ID. |
| POST | `/api/users` | Crear un usuario. |
| PUT | `/api/users/:uid` | Actualizar un usuario. |
| DELETE | `/api/users/:uid` | Eliminar un usuario. |

### Productos

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/products` | Obtener todos los productos. |
| GET | `/api/products/:pid` | Obtener un producto por ID. |
| POST | `/api/products` | Crear un producto. |
| PUT | `/api/products/:pid` | Actualizar un producto. |
| DELETE | `/api/products/:pid` | Eliminar un producto. |

## Manejo centralizado de errores

La API utiliza una capa común para representar, clasificar y responder los errores. Los services detectan las situaciones del dominio y lanzan errores personalizados; los controllers derivan los errores al middleware y no construyen respuestas de error.

La estructura del módulo es:

- `src/errors/error.dictionary.js`: diccionario de códigos, mensajes y estados HTTP.
- `src/errors/app-error.js`: clase base `AppError` y errores personalizados del dominio.
- `src/middlewares/async-handler.js`: deriva al middleware global los errores de handlers asíncronos de Express.
- `src/middlewares/error-handler.js`: normaliza errores de la aplicación, Express y Mongoose y construye la única respuesta HTTP de error.
- `src/app.js`: registra el manejador de rutas inexistentes y el middleware global al final de la cadena.

### Formato de respuesta

Todas las respuestas de error utilizan esta estructura:

```json
{
  "status": "error",
  "error": {
    "code": "INVALID_MOCK_QUANTITY",
    "message": "El parámetro qty debe ser un entero entre 1 y 100."
  }
}
```

`code` identifica el error de manera estable y `message` explica el problema. En errores de validación de Mongoose puede aparecer también `details` con los campos involucrados. Los errores internos no exponen mensajes técnicos ni detalles de la base de datos.

### Errores contemplados

- `VALIDATION_ERROR` (400): datos de entrada que no cumplen las validaciones.
- `INVALID_JSON` (400): cuerpo de la solicitud con JSON malformado.
- `INVALID_ID` (400): identificador con formato incorrecto.
- `INVALID_STATE` (400): estado fuera de los valores permitidos.
- `INVALID_MOCK_QUANTITY` (400): `qty` no entero, menor que 1 o mayor que 100.
- `INVALID_MOCK_ENTITY` (400): valor de `entity` distinto de `users` o `all`.
- `USER_NOT_FOUND`, `PRODUCT_NOT_FOUND`, `ORDER_NOT_FOUND` y `DELIVERY_NOT_FOUND` (404): recurso inexistente.
- `ROUTE_NOT_FOUND` (404): endpoint inexistente.
- `DUPLICATE_EMAIL` y `DUPLICATE_RESOURCE` (409): conflicto por recurso duplicado.
- `MOCK_SEED_FAILED` (500): fallo durante la carga de datos ficticios.
- `DATABASE_ERROR` e `INTERNAL_SERVER_ERROR` (500): fallas internas o de persistencia.

Los errores de Mongoose se traducen centralmente: validaciones a `VALIDATION_ERROR`, errores de casteo a `INVALID_ID` y claves duplicadas a errores de conflicto. El middleware también controla el JSON malformado (`INVALID_JSON`).

### Cómo probar los errores

Con el servidor iniciado (`npm run dev`), se pueden enviar estas solicitudes desde Postman:

| Método | Solicitud | Resultado esperado |
|---|---|---|
| GET | `/api/mocks/users?qty=0` | 400 — `INVALID_MOCK_QUANTITY` |
| GET | `/api/mocks/users?qty=-2` | 400 — `INVALID_MOCK_QUANTITY` |
| GET | `/api/mocks/users?qty=abc` | 400 — `INVALID_MOCK_QUANTITY` |
| GET | `/api/mocks/users?qty=101` | 400 — `INVALID_MOCK_QUANTITY` |
| POST | `/api/mocks/seed?qty=1&entity=orders` | 400 — `INVALID_MOCK_ENTITY` |
| GET | `/api/users/no-es-un-id` | 400 — `INVALID_ID` |
| GET | `/api/api-que-no-existe` | 404 — `ROUTE_NOT_FOUND` |

Para probar `INVALID_JSON`, enviar `POST /api/users` con `Content-Type: application/json` y un body malformado, por ejemplo:

```text
{json-invalido
```

Para probar `VALIDATION_ERROR`, enviar `POST /api/products` con un producto incompleto, por ejemplo:

```json
{
  "name": "",
  "price": -1,
  "stock": -2
}
```

Para probar un recurso inexistente con un ID sintácticamente válido, consultar un ObjectId de 24 caracteres hexadecimales que no exista en la base de datos; el resultado esperado es 404 (`USER_NOT_FOUND` o `PRODUCT_NOT_FOUND`).

Los fallos durante `POST /api/mocks/seed` se traducen a `MOCK_SEED_FAILED`. La carga completa intenta revertir las inserciones parciales, eliminando primero entregas, luego pedidos y finalmente usuarios, para reducir el riesgo de dejar referencias huérfanas. No se debe provocar un fallo de base de datos en una base de producción para probar este caso.

## Logging y monitoreo básico

La aplicación utiliza **Winston** como logger centralizado. Los mensajes incluyen timestamp, nivel y descripción; cuando corresponde, también incluyen contexto técnico sin registrar contraseñas ni cuerpos completos de solicitudes.

### Niveles de log

Se definen seis niveles personalizados, ordenados de mayor a menor severidad:

| Nivel | Uso |
|---|---|
| `fatal` | Fallas críticas que impiden iniciar o mantener el servicio. |
| `error` | Errores inesperados, fallas de persistencia o de operaciones. |
| `warning` | Solicitudes rechazadas y errores esperados del dominio. |
| `info` | Inicio del servidor, conexión a MongoDB y operaciones importantes. |
| `http` | Solicitudes HTTP completadas, con método, ruta, estado y duración. |
| `debug` | Información detallada útil durante el desarrollo. |

### Diferencias por entorno

El comportamiento se determina mediante `NODE_ENV`:

- `development`: nivel mínimo `debug`, por lo que se muestran todos los niveles.
- `production`: nivel mínimo `info`; se filtran `http` y `debug` para reducir el volumen de registros.
- `test`: se silencian los transports del logger para que las pruebas no generen archivos de logs.

Se puede sobrescribir el nivel mínimo mediante la variable opcional `LOG_LEVEL` (`debug`, `http`, `info`, `warning`, `error` o `fatal`). Si no se define, se utiliza el nivel predeterminado del entorno.

### Persistencia y rotación

Los registros se muestran en consola y los niveles `error` y `fatal` se guardan en:

```text
logs/error.log
```

El archivo se rota por tamaño: al alcanzar **5 MB**, Winston genera archivos numerados de respaldo y mantiene un máximo de **14 archivos**. El archivo activo continúa siendo `logs/error.log`.

La carpeta `/logs/` está incluida en `.gitignore`, por lo que los registros generados no se suben a GitHub. La aplicación crea la carpeta automáticamente cuando inicia.

### Endpoint de prueba

Con el servidor iniciado en desarrollo, ejecutar desde Postman:

```http
GET http://localhost:3000/api/logger-test
```

El endpoint genera un registro de prueba en cada nivel (`debug`, `http`, `info`, `warning`, `error` y `fatal`) y devuelve una respuesta exitosa con la lista de niveles ejecutados.

En desarrollo, todos los niveles pueden verse en la consola. En `logs/error.log` solamente deben aparecer `error` y `fatal`. En producción se aplica el filtro definido por `LOG_LEVEL` o el nivel predeterminado `info`.

El endpoint es una herramienta interna de verificación y no representa una operación del negocio.

## Documentación de API con Swagger / OpenAPI

La API expone documentación interactiva mediante **Swagger UI**, basada en una especificación **OpenAPI 3.0.3**.

- Interfaz interactiva: `http://localhost:3000/api/docs`
- Especificación JSON: `http://localhost:3000/api/docs/openapi.json`

La configuración de Swagger está separada de las rutas de negocio:

- `src/docs/openapi.js`: información general de la API, tags, paths, parámetros, request bodies, respuestas y schemas reutilizables.
- `src/config/swagger.js`: configuración de Swagger UI y registro de las rutas de documentación.
- `src/app.js`: monta la documentación en `/api/docs` antes del manejador global de rutas inexistentes.

Para acceder, iniciar el servidor con `npm run dev` y abrir `http://localhost:3000/api/docs` en el navegador. Desde Swagger UI se pueden consultar los endpoints y utilizar **Try it out** para enviar solicitudes al servidor local.

### Módulos documentados

La documentación está organizada por los tags `Users`, `Orders`, `Deliveries`, `Mocks`, `Logger` y `Products`:

- **Users:** listado, consulta por ID, creación, actualización y eliminación; también generación mock de usuarios y repartidores.
- **Orders:** listado, creación, consulta por ID, actualización de estados y generación mock de pedidos.
- **Deliveries:** generación mock de entregas.
- **Mocks:** generación conjunta en memoria y carga controlada en MongoDB.
- **Logger:** endpoint interno `GET /api/logger-test` para ejecutar los seis niveles de Winston. Es una herramienta de validación, no una funcionalidad del negocio.
- **Products:** listado, consulta por ID, creación, actualización y eliminación.

**Aclaración sobre Deliveries:** no existen rutas CRUD independientes para entregas. La entidad está modelada y se genera mediante `GET /api/mocks/deliveries`; los pedidos sí cuentan con endpoints de consulta, creación y actualización de estado.

### Schemas reutilizables

La especificación define los schemas `User`, `Order`, `Delivery`, `OrderItem`, `ShippingAddress`, `Product`, `ErrorResponse`, `SuccessResponse`, `MockDataset` y las respuestas de carga del seed.

Los schemas de usuario público no exponen la contraseña; el campo `password` solo forma parte del body de alta o actualización de usuario.

### Errores documentados

Las operaciones documentan las respuestas de error reales de la API y reutilizan el formato centralizado:

```json
{
  "status": "error",
  "error": {
    "code": "INVALID_MOCK_QUANTITY",
    "message": "El parámetro qty debe ser un entero entre 1 y 100."
  }
}
```

La especificación contempla errores de validación (`VALIDATION_ERROR`), JSON inválido (`INVALID_JSON`), identificadores inválidos (`INVALID_ID`), estados inválidos (`INVALID_STATE`), recursos inexistentes, duplicados, cantidades o entidades mock inválidas, errores de base de datos y errores internos.

`INVALID_STATE`, `ORDER_NOT_FOUND` y `DELIVERY_NOT_FOUND` son códigos del dominio ya definidos. Actualmente no hay endpoints públicos de escritura o consulta individual de entregas que permitan provocar directamente todos esos casos.

La API actual no implementa autenticación ni rutas protegidas; por eso la documentación no declara respuestas `401` o `403` ni esquemas de seguridad inexistentes.

### Probar los mocks desde Swagger

- Para generar información sin persistirla, usar los GET `/api/mocks/users`, `/api/mocks/drivers`, `/api/mocks/orders`, `/api/mocks/deliveries` o `/api/mocks/all`.
- Para insertar datos, usar `POST /api/mocks/seed` y completar los query parameters `qty` y `entity`. No requiere body JSON.
- `qty` debe ser un entero entre 1 y 100.
- `entity` admite `users` o `all`; si se omite, utiliza `users`.
- Para el conjunto completo, `entity=all` inserta usuarios, repartidores, pedidos y entregas relacionados.

## Testing funcional (Módulo 6)

La suite funcional utiliza **Mocha** para organizar y ejecutar pruebas, **Chai** para las aserciones y **Supertest** para realizar solicitudes HTTP directamente sobre la aplicación Express, sin abrir manualmente un puerto.

### Entorno de testing

Las pruebas utilizan una base MongoDB exclusiva. Crear `.env.test` a partir de `.env.test.example` y configurar `MONGODB_URI_TEST` con una base cuyo nombre incluya `test` (por ejemplo, `shipnow_test`).

El setup nunca utiliza `MONGODB_URI` de desarrollo y verifica que el nombre de la base de testing sea distinto del de desarrollo.

Variables necesarias en `.env.test`:

```env
NODE_ENV=test
MONGODB_URI_TEST=TU_URI_DE_MONGODB_DE_TESTING
```

`.env.test` está excluido de Git y no debe publicarse. Las pruebas requieren conexión a esa base de testing; no utilizan la base de desarrollo ni datos cargados manualmente.

### Ejecutar las pruebas

```bash
npm install
npm test
```

La suite está organizada en `tests/` y cubre:

- **Users:** listado, creación, consulta y errores.
- **Orders:** listado, creación, consulta por ID y actualización de estado.
- **Mocks:** generación de datos, relaciones, persistencia y validaciones de parámetros.
- **Logger:** endpoint de prueba de Winston.
- **Swagger:** interfaz y especificación OpenAPI.
- **Errores HTTP:** validaciones, identificadores inválidos, recursos inexistentes y rutas inexistentes.

Se validan los códigos de estado, la estructura de las respuestas y las propiedades importantes del body.

Para probar la creación de pedidos, cada test crea primero un usuario válido dentro de la base de testing.

La limpieza se ejecuta automáticamente antes de la suite y después de cada test, eliminando documentos de Users, Products, Orders y Deliveries. Esto permite ejecutar `npm test` varias veces sin depender del estado previo.

El setup importa `src/app.js` directamente; el levantamiento del servidor y la conexión de desarrollo permanecen en `src/server.js`.

---

**Proyecto académico — Coderhouse**  
Programación Backend (III): Testing y Escalabilidad.