const express = require("express");

const controller =
  require("./vehicle-type.controller");

const authMiddleware =
  require("../../middlewares/auth.middleware");

const router = express.Router();
console.log("vehicle-type.routes loaded");
router.get(
  "/",
  authMiddleware,
  controller.getAll
);

module.exports = router;