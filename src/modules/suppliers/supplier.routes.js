const express = require("express");

const controller =
  require("./supplier.controller");

const authMiddleware =
  require("../../middlewares/auth.middleware");

const roleMiddleware =
  require("../../middlewares/role.middleware");

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  controller.getAll
);

// Crear proveedores es una operación de datos maestros: solo ADMIN.
// Hoy se usa principalmente desde el alta de usuarios (cuando el rol
// es Proveedor y todavía no existe en el sistema).
router.post(
  "/",
  authMiddleware,
  roleMiddleware("ADMIN"),
  controller.create
);

module.exports = router;
