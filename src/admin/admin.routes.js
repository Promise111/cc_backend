const { body } = require("express-validator");
const auth = require("../middlewares/auth.middleware");
const express = require("express");
const router = express.Router();
const {
  getWallet,
  createWallet,
  updateWallet,
  deleteWallet,
  getTransactions,
  fetchUsers,
  getUserTransactions,
  updateUserInfo,
  deleteUserInfo,
  updateTransaction,
  getUserProfileById,
  getTransactionsCount,
  getTransactionById,
  getWallets,
  getUser,
} = require("./admin.controller");

router.get("/profile/:userId", auth, getUserProfileById);
router.get("/wallet", getWallets);
router.get("/wallet/:walletId", getWallet);
router.post("/wallet", [auth], createWallet);
router.put("/wallet/:walletId", [auth], updateWallet);
router.delete("/wallet/:walletId", [auth], deleteWallet);
router.get("/transactions", [auth], getTransactions);
router.get("/transactions/count", auth, getTransactionsCount);
router.put("/transaction/:transactionId", [auth], updateTransaction);
router.get("/transaction/:transactionId", auth, getTransactionById);
router.put("/transactions/:userId/transactions", [auth], getUserTransactions);
router.get("/user", [auth], fetchUsers);
router.get("/user/:userId/transactions", [auth], getUserTransactions);
router.put("/user/:userId", [auth], updateUserInfo);
router.get("/user/:userId", [auth], getUser);
router.delete("/user/:userId", [auth], deleteUserInfo);

module.exports = router;
