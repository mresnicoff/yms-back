const express = require("express");

const controller = require("./infolog.controller");

const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");

const router = express.Router();

router.post(
  "/sync",
  authMiddleware,
  roleMiddleware("ADMIN", "PLANNER", "GATE_OPERATOR"),
  controller.sync
);

module.exports = router;
