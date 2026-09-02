const express = require("express");

const controller =
  require("./dock-operation.controller");

const authMiddleware =
  require("../../middlewares/auth.middleware");

const roleMiddleware =
  require("../../middlewares/role.middleware");

const router = express.Router();

const operatorRoles = roleMiddleware(
  "ADMIN",
  "PLANNER",
  "YARD_OPERATOR",
  "GATE_OPERATOR"
);

router.get(
  "/active",
  authMiddleware,
  operatorRoles,
  controller.getActive
);

router.post(
  "/assign",
  authMiddleware,
  operatorRoles,
  controller.assign
);
router.get(
  "/queue/:dockGroupId",
  authMiddleware,
  operatorRoles,
  controller.getQueue
);
router.post(
  "/finish",
  authMiddleware,
  operatorRoles,
  controller.finish
);
router.get(
  "/docks/:dockGroupId",
  authMiddleware,
  operatorRoles,
  controller.getDocksByGroup
);
router.post(
  "/manual-assign",
  authMiddleware,
  operatorRoles,
  controller.manualAssign
);

module.exports = router;