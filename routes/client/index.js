const express = require("express");
// const authAdminMiddleware = require("../../middlewares/admin/adminAuth");
const router = express.Router();

router.use("/auth", require("./auth"));
router.use("/profile", require("./profile"));

module.exports = router;
