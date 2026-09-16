const express = require("express");
const controller = require("./warehouse.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");

const router = express.Router();

// Lectura básica: la usan formularios de cualquier rol logueado (ej. crear
// turno necesita listar los warehouses activos).
router.get("/", authMiddleware, controller.getAll);

// Administración de warehouses (alta, edición, ver todo incl. inactivos):
// exclusivo de ADMIN, mismo criterio que el módulo de Usuarios.
router.get(
  "/admin",
  authMiddleware,
  roleMiddleware("ADMIN"),
  controller.getAllAdmin
);

router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN"),
  controller.getById
);

router.post(
  "/",
  authMiddleware,
  roleMiddleware("ADMIN"),
  controller.create
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN"),
  controller.update
);

module.exports = router;
