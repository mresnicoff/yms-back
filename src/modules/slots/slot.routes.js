const express = require("express");

const controller =
  require("./slot.controller");

const authMiddleware =
  require("../../middlewares/auth.middleware");

const router =
  express.Router();

router.get(
  "/availability",
  authMiddleware,
  controller.getAvailability
);

module.exports = router;