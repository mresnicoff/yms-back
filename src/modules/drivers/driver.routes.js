const express = require("express");

const controller =
  require("./driver.controller");

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

router.put(
  "/:id",
  authMiddleware,
  controller.update
);

router.delete(
  "/:id",
  authMiddleware,
  controller.remove
);

module.exports = router;