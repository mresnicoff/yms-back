const express = require("express");

const controller = require("./dock.controller");

const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");

const router = express.Router();

// Alta, baja y edición de docks individuales: parte del módulo de
// administración de warehouses, exclusivo de ADMIN.
router.use(
  authMiddleware,
  roleMiddleware("ADMIN")
);

router.get(
  "/",
  controller.listByGroup
);

router.post(
  "/",
  controller.create
);

router.post(
  "/bulk",
  controller.createBulk
);

router.put(
  "/:id",
  controller.update
);

module.exports = router;
