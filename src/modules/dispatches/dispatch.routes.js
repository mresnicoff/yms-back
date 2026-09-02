const express =
  require("express");

const controller =
  require("./dispatch.controller");

const authMiddleware =
  require("../../middlewares/auth.middleware");

const roleMiddleware =
  require("../../middlewares/role.middleware");

const router =
  express.Router();

router.post(
  "/",
  authMiddleware,
  roleMiddleware("ADMIN", "PLANNER", "YARD_OPERATOR", "GATE_OPERATOR"),
  controller.create
);

module.exports =
  router;