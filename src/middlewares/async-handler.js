// Express 4 no captura automáticamente los rechazos de handlers async.
// Este wrapper los deriva al middleware global de errores.
export const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve()
    .then(() => handler(req, res, next))
    .catch(next);
};
