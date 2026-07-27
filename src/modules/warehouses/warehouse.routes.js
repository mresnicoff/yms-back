const express = require("express");
const controller = require("./warehouse.controller");
const authMiddleware =require("../../middlewares/auth.middleware");

const router = express.Router();

router.get("/", authMiddleware,controller.getAll);


module.exports = router;