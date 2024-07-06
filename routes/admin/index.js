const express = require("express");
const authMiddleware = require("../../middlewares/authMiddleware");
const { getFullTree } = require("../../controllers/admin/tree");
const { blockUser } = require("../../controllers/admin/blockUser");
const router = express.Router();

router.use("/auth", require("./auth"));
router.get("/tree", authMiddleware, getFullTree);
router.put("/block-user", authMiddleware, blockUser);

module.exports = router;
