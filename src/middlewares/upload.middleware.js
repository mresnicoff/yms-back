const multer = require("multer");

// Guardamos el archivo en memoria (como Buffer), no en disco: en Vercel el
// filesystem de las funciones serverless es efímero y de solo lectura fuera
// de /tmp, así que nunca hay que asumir que un archivo escrito ahí persiste
// entre requests. El buffer resultante se sube a Vercel Blob en el handler
// de la ruta (ver documents/document.routes.js).
const storage = multer.memoryStorage();

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

module.exports = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES
  }
});
