const express = require("express");

const controller =
  require("./dock-group.controller");

const authMiddleware =
  require("../../middlewares/auth.middleware");

const roleMiddleware =
  require("../../middlewares/role.middleware");

const router = express.Router();

// Lectura básica: la usa el formulario de turnos (cualquier rol logueado).
router.get(
  "/",
  authMiddleware,
  controller.getAll
);

// Administración de dock groups (dentro del módulo de warehouses):
// exclusivo de ADMIN.
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
