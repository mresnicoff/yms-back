const express = require("express");

const controller = require("./dashboard.controller");

const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");

const router = express.Router();

// Mismo criterio de acceso que la pantalla de Dashboard en el frontend
// (Sidebar/AppRouter): ADMIN, PLANNER y YARD_OPERATOR.
router.use(
  authMiddleware,
  roleMiddleware("ADMIN", "PLANNER", "YARD_OPERATOR")
);

router.get(
  "/summary",
  controller.getSummary
);

module.exports = router;
