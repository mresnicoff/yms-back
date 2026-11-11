const express = require("express");

const controller = require("./sla.controller");

const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");

const router = express.Router();

router.use(authMiddleware, roleMiddleware("ADMIN", "PLANNER"));

router.get("/", controller.getReport);

module.exports = router;
