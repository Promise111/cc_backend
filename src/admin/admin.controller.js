const Wallet = require("../user/wallet.model");
const Transaction = require("../user/transaction.model");
const { User } = require("../user/user.model");
const CONSTANTS = require("../utils/const");

const getWallets = async (req, res, next) => {
  try {
    const { limit, page, search } = req.query;
    const LIMIT = limit || CONSTANTS.LIMIT;
    const PAGE = page || 1;
    const skip = (+PAGE - 1) * limit;
    let total = 0;
    const filter = {};
    if (search) {
      const searchString = search;
      const regex = new RegExp(searchString, "i");
      filter.$or = [
        { name: { $regex: regex } },
        // { dollarAmount: { $regex: regex } },
        { walletAddress: { $regex: regex } },
      ];
    }
    total = await Wallet.countDocuments(filter);
    const data = await Wallet.find(filter)
      .sort({ createdAT: -1 })
      .skip(skip)
      .limit(LIMIT);
    return res.status(200).json({
      message: "Wallets fetched",
      data,
      currentPage: PAGE,
      limit: LIMIT,
      pages: Math.ceil(total / LIMIT),
      total,
    });
  } catch (error) {
    next(error);
  }
};

const getWallet = async (req, res, next) => {
  try {
    const { walletId } = req.params;
    const data = await Wallet.findById(walletId);
    return res.status(200).json({ message: "Wallet fetched", data });
  } catch (error) {
    next(error);
  }
};

const createWallet = async (req, res, next) => {
  try {
    const { userId, role } = req.user;
    if (role !== "admin") {
      return res.status(401).json({ message: "Unauthorized", data: null });
    }
    let { name, dollarAmount, walletAddress } = req.body;
    if (!name || !dollarAmount || !walletAddress) {
      return res.status(400).json({
        message: "name, dollarAmount and walletAddress",
        data: req.body,
      });
    }
    let walletName = RegExp(name, "i");
    const walletExists = await Wallet.findOne({ name: walletName });
    if (walletExists) {
      return res
        .status(409)
        .json({ message: "Wallet already exists", data: walletExists });
    }
    const data = new Wallet({ name, dollarAmount, walletAddress });
    await data.save();
    return res.status(200).json({ message: "Wallet saved successfully", data });
  } catch (error) {
    next(error);
  }
};

const deleteWallet = async (req, res, next) => {
  try {
    const { role } = req.user;
    if (role !== "admin") {
      return res.status(401).json({ message: "Unauthorized", data: null });
    }
    let { walletId } = req.params;
    const wallet = Wallet.findOne({ _id: walletId });
    if (!wallet) {
      return res
        .status(404)
        .json({ message: "Wallet not found", data: wallet });
    }
    await Wallet.findByIdAndDelete(walletId);
    return res
      .status(200)
      .json({ message: "Wallet deleted successfully", data });
  } catch (error) {
    next(error);
  }
};

const updateWallet = async (req, res, next) => {
  try {
    const { role } = req.user;
    if (role !== "admin") {
      return res.status(401).json({ message: "Unauthorized", data: null });
    }
    let { name, dollarAmount, walletAddress } = req.body;
    let { walletId } = req.params;
    const wallet = Wallet.findOne({ _id: walletId });
    if (!wallet) {
      return res
        .status(404)
        .json({ message: "Wallet not found", data: wallet });
    }
    if (name && name != "") {
      wallet.name = name;
    }
    if (dollarAmount && dollarAmount != "") {
      wallet.dollarAmount = parseInt(dollarAmount);
    }
    if (walletAddress && walletAddress != "") {
      wallet.walletAddress = walletAddress;
    }
    await wallet.save();
    return res
      .status(200)
      .json({ message: "Wallet updated successfully", data });
  } catch (error) {
    next(error);
  }
};

const getTransactions = async (req, res, next) => {
  try {
    const { status, type } = req.params;
    const { role } = req.user;
    const { limit, page, search } = req.query;
    const LIMIT = limit || CONSTANTS.LIMIT;
    const PAGE = page || 1;
    const skip = (+PAGE - 1) * limit;
    let total = 0;
    if (role !== "admin") {
      return res.status(401).json({ message: "Unauthorized", data: null });
    }
    let filter = {};
    if (status) filter["status"] = status;
    if (type) filter["type"] = type;
    if (search) {
      const searchString = search;
      const regex = new RegExp(searchString, "i");
      filter.$or = [
        { transactionId: { $regex: regex } },
        // { transactionAmount: { $regex: regex } },
        { type: { $regex: regex } },
        { status: { $regex: regex } },
      ];
    }
    total = await Transaction.countDocuments(filter);
    const transactions = await Transaction.find(filter)
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(LIMIT);

    return res.status(200).json({
      message: "Transactions fetched successfully",
      data: transactions,
      currentPage: PAGE,
      limit: LIMIT,
      pages: Math.ceil(total / LIMIT),
      total,
    });
  } catch (error) {
    next(error);
  }
};

const fetchUsers = async (req, res, next) => {
  try {
    const { role } = req.user;
    const { limit, page, search } = req.query;
    const LIMIT = limit || CONSTANTS.LIMIT;
    const PAGE = page || 1;
    const skip = (+PAGE - 1) * limit;
    let total = 0;
    let filter = { role: "customer" };
    if (role !== "admin") {
      return res.status(401).json({ message: "Unauthorized", data: null });
    }
    if (search) {
      const searchString = search;
      const regex = new RegExp(searchString, "i");
      console.log(regex, searchString);
      filter.$or = [
        { fullName: { $regex: regex } },
        { firstName: { $regex: regex } },
        { lastName: { $regex: regex } },
        { userName: { $regex: regex } },
        { phoneNo: { $regex: regex } },
        { email: { $regex: regex } },
      ];
    }
    total = await User.countDocuments(filter);

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(LIMIT);

    return res.status(200).json({
      message: "Users fetched successfully",
      data: users,
      currentPage: PAGE,
      limit: LIMIT,
      pages: Math.ceil(total / LIMIT),
      total,
    });
  } catch (error) {
    next(error);
  }
};

const getUserTransactions = async (req, res, next) => {
  try {
    const { role } = req.user;
    const { limit, page, search } = req.query;
    const LIMIT = limit || CONSTANTS.LIMIT;
    const PAGE = page || 0;
    const skip = (+PAGE - 1) * limit;
    let total = 0;
    if (role !== "admin") {
      return res.status(401).json({ message: "Unauthorized", data: null });
    }
    const { userId } = req.params;
    total = await Transaction.countDocuments({ customerId: userId });
    const transactions = await Transaction.find({ customerId: userId }).sort({
      createdAt: -1,
    });
    return res.status(200).json({
      message: "User transactions fetched successfully",
      data: transactions,
      currentPage: PAGE,
      limit: LIMIT,
      pages: Math.ceil(total / LIMIT),
      total,
    });
  } catch (error) {
    next(error);
  }
};

const updateUserInfo = async (req, res, next) => {
  try {
    const { role } = req.user;
    if (role !== "admin") {
      return res.status(401).json({ message: "Unauthorized", data: null });
    }
    let {
      totalWon,
      totalLoss,
      packageId,
      capital,
      accumulatingBalance,
      profits,
      accountNumber,
      accountName,
      bankName,
      swiftCode,
      bitcoinAddress,
      ethAddress,
      cashApp,
      payPalEmail,
    } = req.body;
    let { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found", data: user });
    }
    if (totalWon && totalWon != "") {
      user.totalWon = parseInt(totalWon);
    }
    if (totalLoss && totalLoss != "") {
      user.totalLoss = parseInt(totalLoss);
    }
    if (packageId && packageId != "") {
      user.packageId = packageId;
    }
    if (capital && capital != "") {
      user.capital = parseInt(capital);
    }
    if (accumulatingBalance && accumulatingBalance != "") {
      user.accumulatingBalance = parseInt(accumulatingBalance);
    }
    if (profits && profits != "") {
      user.profits = parseInt(profits);
    }
    if (accountNumber && accountNumber != "") {
      user.accountNumber = accountNumber;
    }
    if (accountName && accountName != "") {
      user.accountName = accountName;
    }
    if (bankName && bankName != "") {
      user.bankName = bankName;
    }
    if (swiftCode && swiftCode != "") {
      user.swiftCode = swiftCode;
    }
    if (bitcoinAddress && bitcoinAddress != "") {
      user.bitcoinAddress = bitcoinAddress;
    }
    if (ethAddress && ethAddress != "") {
      user.ethAddress = ethAddress;
    }
    if (cashApp && cashApp != "") {
      user.cashApp = cashApp;
    }
    if (payPalEmail && payPalEmail != "") {
      user.payPalEmail = payPalEmail;
    }
    await user.save();
    return res
      .status(200)
      .json({ message: "User information updated successfully", data: user });
  } catch (error) {
    next(error);
  }
};

const deleteUserInfo = async (req, res, next) => {
  try {
    const { role } = req.user;
    if (role !== "admin") {
      return res.status(401).json({ message: "Unauthorized", data: null });
    }
    let { userId: customerId } = req.params;
    const user = User.findById(customerId).select("_id");
    if (!user) {
      return res.status(404).json({ message: "User not found", data: user });
    }

    await User.findByIdAndDelete(customerId);
    return res.status(200).json({ message: "User deleted successfully", data });
  } catch (error) {
    next(error);
  }
};

const updateTransaction = async (req, res, next) => {
  try {
    const { role } = req.user;
    if (role !== "admin") {
      return res.status(401).json({ message: "Unauthorized", data: null });
    }
    let { transactionAmount, status, type } = req.body;
    let { transactionId } = req.params;
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res
        .status(404)
        .json({ message: "Transaction not found", data: transaction });
    }
    if (transactionAmount && transactionAmount != "") {
      transaction.transactionAmount = parseInt(transactionAmount);
    }
    if (status && status != "") {
      transaction.status = status;
    }
    if (type && type != "") {
      transaction.type = type;
    }
    await transaction.save();
    return res
      .status(200)
      .json({ message: "Transaction updated successfully", data: transaction });
  } catch (error) {
    next(error);
  }
};

const getUserProfileById = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(400).json({ message: "Invalid token.", data: user });
    }

    return res
      .status(200)
      .json({ message: "User profile fetched successfully", data: user });
  } catch (e) {
    next(e);
  }
};

const getTransactionsCount = async (req, res, next) => {
  try {
    const pendingCount = await Transaction.countDocuments({
      status: "pending",
    });
    const successCount = await Transaction.countDocuments({
      status: "success",
    });
    const failedCount = await Transaction.countDocuments({ status: "failed" });
    const data = { pendingCount, successCount, failedCount };
    return res
      .status(200)
      .json({ message: "Records fetched successfully", data });
  } catch (error) {
    next();
  }
};

const getTransactionById = async (req, res, next) => {
  try {
    const { role } = req.user;
    const { transactionId } = req.params;
    if (role !== "admin") {
      return res.status(401).json({ message: "Unauthorized", data: null });
    }
    const transaction = await Transaction.findById(transactionId);
    return res.status(200).json({
      message: "Transaction fetched successfully",
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

const getUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const data = await User.findById(userId);
    return res.status(200).json({ message: "User fetched", data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWallet,
  getWallets,
  createWallet,
  deleteWallet,
  updateWallet,
  getTransactions,
  fetchUsers,
  getUserTransactions,
  updateUserInfo,
  deleteUserInfo,
  updateTransaction,
  getUserProfileById,
  getTransactionsCount,
  getTransactionById,
  getUser,
};
