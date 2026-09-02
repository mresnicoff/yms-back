const express = require("express");
const { put } = require("@vercel/blob");

const upload = require("../../middlewares/upload.middleware");
const controller = require("./document.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const { sendError, AppError } = require("../../lib/errors");

const router = express.Router();

router.get("/", authMiddleware, controller.getAll);

router.post("/", authMiddleware, controller.create);

// Sube el archivo directamente a Vercel Blob (storage de objetos) en vez de
// al disco local: el disco de una función serverless de Vercel es efímero,
// así que un archivo escrito ahí desaparece en el próximo request/deploy.
// El body de la respuesta ({ url }) no cambia, así que el frontend no
// necesita ningún cambio.
router.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        throw new AppError("No se recibió ningún archivo.");
      }

      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        throw new AppError(
          "El almacenamiento de archivos no está configurado en el servidor."
        );
      }

      const uniqueName = `${Date.now()}-${req.file.originalname}`;

      const blob = await put(uniqueName, req.file.buffer, {
        access: "public",
        contentType: req.file.mimetype,
        token: process.env.BLOB_READ_WRITE_TOKEN
      });

      res.json({ url: blob.url });
    } catch (error) {
      sendError(res, error, "No se pudo subir el archivo. Intentá nuevamente.");
    }
  }
);

router.get("/driver/:driverId", authMiddleware, controller.getByDriver);

router.get("/truck/:truckId", authMiddleware, controller.getByTruck);

router.delete("/:id", authMiddleware, controller.remove);

module.exports = router;
