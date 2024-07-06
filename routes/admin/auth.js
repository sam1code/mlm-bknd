const express = require("express");
const router = express.Router();
const {
  register,
  login,
  token,
  logout,
} = require("../../controllers/admin/auth.js");

router.post("/register", register);

router.post("/login", login);

router.get("/token", token);

router.head("/logout", logout);

module.exports = router;
