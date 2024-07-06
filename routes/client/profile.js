const express = require("express");
const authMiddleware = require("../../middlewares/authMiddleware");
const { getClientProfile } = require("../../controllers/client/profile");
const router = express.Router();

router.get("/", authMiddleware, getClientProfile);

module.exports = router;
