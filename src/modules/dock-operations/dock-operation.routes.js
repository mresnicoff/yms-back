const express = require("express");

const controller =
  require("./dock-operation.controller");

const router = express.Router();

router.get(
  "/active",
  controller.getActive
);

router.post(
  "/assign",
  controller.assign
);
router.get(
  "/queue/:dockGroupId",
  controller.getQueue
);
router.post(
  "/finish",
  controller.finish
);

module.exports = router;