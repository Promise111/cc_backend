const { body } = require("express-validator");
const {
  signup,
  login,
  changePassword,
  verifyEmail,
  forgotPassword,
  passwordReset,
  updateUserInfo,
  getUserProfile,
  generateUniqueId,
  createTransaction,
  getUserTransactions,
} = require("./user.controller");
const express = require("express");
const auth = require("../middlewares/auth.middleware");
const router = express.Router();

router.put("/", [auth], updateUserInfo);

router.post("/signup", signup);

router.post("/login", login);

router.get("/uniqueId", generateUniqueId);

router.get("/profile", auth, getUserProfile);

// password change functionality
router.put("/change-password", auth, changePassword);

router.get("/verify-email/:token", verifyEmail);

router.post("/transaction", auth, createTransaction);

router.get("/transactions", auth, getUserTransactions);

router.post(
  "/forgot-password",
  [body("email", "Enter valid email address").trim().isEmail()],
  forgotPassword
);

router.post(
  "/reset-password/:token",
  [
    body("newPassword", "Enter valid newPassword")
      .trim()
      .isString()
      .isLength({ min: 1, max: undefined }),
  ],
  passwordReset
);

module.exports = router;
