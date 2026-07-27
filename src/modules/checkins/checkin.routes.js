const express = require("express");

const controller =
  require("./checkin.controller");

const router = express.Router();

router.post("/", controller.create);

module.exports = router;