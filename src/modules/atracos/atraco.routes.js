const express = require("express");

const controller = require("./atraco.controller");

const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");

const router = express.Router();

const operatorRoles = roleMiddleware(
  "ADMIN",
  "PLANNER",
  "YARD_OPERATOR",
  "GATE_OPERATOR"
);

router.post(
  "/",
  authMiddleware,
  operatorRoles,
  controller.create
);

router.get(
  "/by-checkin/:checkInId",
  authMiddleware,
  operatorRoles,
  controller.getByCheckIn
);

module.exports = router;
