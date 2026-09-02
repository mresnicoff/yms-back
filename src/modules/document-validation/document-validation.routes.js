const express =
  require("express");

const controller =
  require(
    "./document-validation.controller"
  );

const authMiddleware =
  require("../../middlewares/auth.middleware");

const router =
  express.Router();

router.post(
  "/check-in",
  authMiddleware,
  controller.validateCheckIn
);

module.exports =
  router;