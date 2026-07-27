const express = require("express");

const controller =
  require("./truck.controller");

const authMiddleware =
  require("../../middlewares/auth.middleware");

const router =
  express.Router();

router.get(
  "/",
  authMiddleware,
  controller.getAll
);

router.post(
  "/",
  authMiddleware,
  controller.create
);

module.exports = router;