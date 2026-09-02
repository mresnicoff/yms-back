/**
 * Error de aplicación: representa un problema esperado (datos inválidos,
 * un recurso que no existe, una regla de negocio que no se cumple, etc).
 * A diferencia de un error inesperado (bug, falla de la base de datos),
 * su mensaje SÍ es seguro para mostrarle al usuario final.
 */
class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.isAppError = true;
  }
}

/**
 * Valida que un objeto de datos tenga todos los campos requeridos
 * (no undefined, no null, no string vacío). Si falta alguno, lanza un
 * AppError con un mensaje claro en español listando qué falta.
 *
 * @param {object} data - objeto a validar (por ejemplo req.body)
 * @param {Record<string,string>} fieldLabels - mapa campo -> etiqueta legible
 *   ej: { supplierId: "Proveedor", vehicleTypeId: "Tipo de vehículo" }
 */
function requireFields(data, fieldLabels) {
  const missing = Object.entries(fieldLabels)
    .filter(([field]) => {
      const value = data ? data[field] : undefined;
      return value === undefined || value === null || value === "";
    })
    .map(([, label]) => label);

  if (missing.length > 0) {
    throw new AppError(
      `Faltan completar los siguientes campos: ${missing.join(", ")}`
    );
  }
}

/**
 * Responde un error de forma segura y consistente:
 * - Si es un AppError (error esperado / de validación), devuelve su
 *   mensaje real con su statusCode (400 por defecto).
 * - Si es cualquier otro error (bug, error de Prisma, etc), lo loguea
 *   completo en el servidor pero responde un mensaje genérico, para no
 *   filtrar detalles internos (queries, nombres de columnas, etc) al cliente.
 */
function sendError(res, error, fallbackMessage = "Ocurrió un error inesperado. Intentá nuevamente.") {
  if (error && error.isAppError) {
    return res.status(error.statusCode || 400).json({
      message: error.message
    });
  }

  console.error(error);

  return res.status(500).json({
    message: fallbackMessage
  });
}

module.exports = {
  AppError,
  requireFields,
  sendError
};
