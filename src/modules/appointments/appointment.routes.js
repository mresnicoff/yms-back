const express = require("express");

const controller =
  require("./appointment.controller");

const authMiddleware =
  require("../../middlewares/auth.middleware");

const roleMiddleware =
  require("../../middlewares/role.middleware");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  roleMiddleware(
    "ADMIN",
    "PLANNER",
    "SUPPLIER"
  ),
  controller.create
);
router.get(
  "/",
  authMiddleware,
  roleMiddleware(
    "ADMIN",
    "PLANNER",
    "SUPPLIER"
  ),
  controller.getAll
);

module.exports = router;