const express =
  require("express");
  const upload =require("../../middlewares/upload.middleware");

const controller =
  require("./document.controller");

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

router.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  (req, res) => {
console.log("FILE:", req.file);
    res.json({

      url:
        `/uploads/${req.file.filename}`

    });

  }
);

router.get(
  "/driver/:driverId",
  authMiddleware,
  controller.getByDriver
);

router.get(
  "/truck/:truckId",
  authMiddleware,
  controller.getByTruck
);
router.delete(
  "/:id",
  authMiddleware,
  controller.remove
);
module.exports =
  router;