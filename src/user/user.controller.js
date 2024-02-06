const { User, Token } = require("../user/user.model");
const Transaction = require("../user/transaction.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { validationResult } = require("express-validator");
const Mailer = require("../utils/mailer/mailer");
const { v4 } = require("uuid");
const CONSTANTS = require("../utils/const");

const login = async (req, res, next) => {
  const { email, password } = req.body;
  console.log(req.body);

  if (!email || !password)
    return res
      .status(400)
      .json({ message: "Invalid Email or Password", data: null });

  try {
    const lowerCaseEmail = email.toLowerCase();

    let user = await User.findOne({ email: lowerCaseEmail });

    if (!user)
      return res
        .status(400)
        .json({ message: "Invalid Email or Password", data: null });

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!validPassword)
      return res
        .status(400)
        .json({ message: "Invalid email or password", data: null });

    if (!user.isVerified) {
      return res
        .status(401)
        .json({ message: "Your email has not been verified", data: null });
    }
    await user.save();
    const token = user.generateToken();

    res.set("Authorization", token);
    res.set("Access-Control-Expose-Headers", "Authorization");
    return res.status(200).json({
      message: "User login successful",
      user,
      auth_token: token,
    });
  } catch (error) {
    next(error);
  }
};

const signup = async (req, res, next) => {
  const {
    fullName,
    userName,
    email,
    phoneNo,
    country,
    password,
    confirm_password,
  } = req.body;

  if (
    !fullName ||
    !userName ||
    !email ||
    !phoneNo ||
    !country ||
    !password ||
    !confirm_password
  )
    return res.status(400).json({ message: "Incorrect data", data: null });

  if (password !== confirm_password)
    return res.status(400).json({ message: "Confirm password", data: null });

  try {
    // let id = v4() + v4();
    // let referralCode = v4().replace("-", "");
    const lowerCaseEmail = email.toLowerCase();

    let user = await User.findOne({ email: lowerCaseEmail });

    if (user)
      return res.status(400).json({
        message: "User already available with that email",
        data: null,
      });
    const users = await User.find();
    user = new User({
      fullName,
      userName,
      email: lowerCaseEmail,
      phoneNo,
      country,
      password: password,
    });

    if (users.length === 0) {
      user.role = "admin";
      user.isActivated = true;
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    let token = new Token({
      userId: user._id,
      token: crypto.randomBytes(16).toString("hex"),
    });

    let newToken = await token.save();
    if (!newToken) {
      return res
        .status(500)
        .json({ message: "Could not save user", data: null });
    }
    await user.save();

    Mailer.sendWelcomeMail({
      recipient: user.email,
      firstName: user.firstName,
    });

    const link = `${process.env.BASE_URL}/api/user/verify-email/${newToken.token}`;
    Mailer.sendEmailVerificationMail({
      recipient: user.email,
      firstName: user.firstName,
      link,
    });

    return res
      .status(200)
      .json({ message: "Account created successfully", data: user });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(userId);

    if (oldPassword === newPassword) {
      return res
        .status(422)
        .json({ message: "old password can not be same as new password" });
    }

    // Check if the old password matches the stored password
    const passwordMatch = await bcrypt.compare(oldPassword, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid old password" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;

    await user.save();

    return res.status(200).json({
      message: "Password changed successfully",
      user,
      // passwordMatch,
    });
  } catch (e) {
    next(e);
  }
};

const verifyEmail = async (req, res, next) => {
  const { token } = req.params;
  try {
    const tokenRecord = await Token.findOne({ token });
    if (!tokenRecord) {
      return res.status(400).json({ message: "Invalid token", data: token });
    }
    const user = await User.findById(tokenRecord?.userId);
    if (!user) {
      console.log(`User with id ${tokenRecord?.userId} not found`);
      return res.status(401).json({ message: "User unauthorized", data: user });
    }
    user.isVerified = true;
    await user.save();
    await Token.findByIdAndDelete(tokenRecord?._id);
    if (user.role === "customer") {
      return res.redirect(`${process.env.WEBSITE_URL}login`);
    }
    if (user.role === "admin") {
      return res.redirect(`${process.env.ADMIN_URL}login`);
    }
  } catch (e) {
    next(e);
  }
};

const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: "Bad request", data: errors.array() });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Unauthorized", data: user });
    }
    const token = jwt.sign({ userId: user._id }, process.env.CC_SECRET, {
      expiresIn: "1d",
    });
    const link = `${process.env.BASE_URL}/api/user/reset-password/${token}`;
    Mailer.sendResetPasswordMail({
      recipient: user.email,
      firstName: user.firstName,
      link,
    });

    return res
      .status(200)
      .json({ message: "Password reset mail sent to email", data: null });
  } catch (e) {
    next(e);
  }
};

const passwordReset = async (req, res, next) => {
  const { token } = req.params;
  const newPassword = req.body.password;
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: "Bad request", data: errors.array() });
    }

    const decoded = jwt.verify(token, process.env.CC_SECRET);

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(400).json({ message: "Invalid token.", data: user });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    return res
      .status(200)
      .json({ message: "Password reset successful", data: user });
  } catch (e) {
    next(e);
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
      fullName,
      firstName,
      lastName,
      email,
      phoneNo,
      address,
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
    const user = User.findById(userId);
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
    if (firstName && firstName != "") {
      user.firstName = firstName;
    }
    if (lastName && lastName != "") {
      user.lastName = lastName;
    }
    if (email && email != "") {
      user.email = email;
    }
    if (phoneNo && phoneNo != "") {
      user.phoneNo = phoneNo;
    }
    if (address && address != "") {
      user.address = address;
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
    if (address && address != "") {
      user.address = address;
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
    return res.status.json({ message: "Wallet updated successfully", data });
  } catch (error) {
    next(error);
  }
};

const getUserProfile = async (req, res, next) => {
  const { userId } = req.user;
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

const generateUniqueId = async (req, res, next) => {
  try {
    return res
      .status(200)
      .json({ message: "Unique id generated successfully", data: v4() });
  } catch (error) {
    next(error);
  }
};

const createTransaction = async (req, res, next) => {
  const { userId } = req.user;
  const { uniqueId, transactionType, transactionAmount } = req.body;
  try {
    const user = await User.findById(userId).select("_id");
    const transaction = new Transaction({
      transactionId: uniqueId,
      customerId: user?._id,
      transactionAmount: parseInt(transactionAmount),
      type: transactionType,
    });
    await transaction.save();
    return res.status(200).json({ message: "Success", data: transaction });
  } catch (error) {
    next(error);
  }
};

const getUserTransactions = async (req, res, next) => {
  const { userId } = req.user;
  const { limit, page } = req.query;
  const LIMIT = limit || CONSTANTS.LIMIT;
  const PAGE = page || 0;
  const skip = (+PAGE - 1) * limit;
  let total = 0;
  try {
    const total = await Transaction.countDocuments({ customerId: userId });
    const transactions = await Transaction.find({ customerId: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(LIMIT);
    return res.status(200).json({
      message: "Transactions fetched successfully",
      data: transactions,
      currentPage: PAGE,
      limit: LIMIT,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  signup,
  changePassword,
  verifyEmail,
  forgotPassword,
  passwordReset,
  updateUserInfo,
  getUserProfile,
  generateUniqueId,
  createTransaction,
  getUserTransactions,
};
