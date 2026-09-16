const express = require("express");

const controller = require("./user.controller");

const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");

const router = express.Router();

// Todas las rutas de este módulo son exclusivas del rol ADMIN:
// gestionar usuarios (crear, editar, resetear contraseñas) es
// una operación sensible que no debe depender solo de que el
// menú lateral oculte el link.
router.use(
  authMiddleware,
  roleMiddleware("ADMIN")
);

router.get(
  "/",
  controller.getAll
);

router.get(
  "/roles",
  controller.getRoles
);

router.post(
  "/",
  controller.create
);

router.put(
  "/:id",
  controller.update
);

router.put(
  "/:id/reset-password",
  controller.resetPassword
);

module.exports = router;
