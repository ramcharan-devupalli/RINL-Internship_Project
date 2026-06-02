const express = require("express");
const router = express.Router();

const {
  signup,
  verifyEmailOtp,
  login
} = require("../controllers/authController");

router.post("/signup", signup);
router.post("/verify-email-otp", verifyEmailOtp);
router.post("/login", login);

module.exports = router;