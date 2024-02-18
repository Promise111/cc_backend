const { Schema, model } = require("mongoose");
const jwt = require("jsonwebtoken");

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      minlength: 2,
    },
    firstName: {
      type: String,
      required: false,
      minlength: 2,
    },
    lastName: {
      type: String,
      required: false,
      minlength: 2,
    },
    userName: {
      type: String,
      required: true,
      minlength: 2,
      unique: true,
    },
    email: {
      type: String,
      minlength: 3,
      maxlength: 255,
      required: true,
    },
    role: {
      type: String,
      minlength: 3,
      maxlength: 255,
      required: true,
      enum: ["admin", "customer"],
      default: "customer",
    },
    phoneNo: {
      type: String,
      minlength: 7,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    password: {
      type: String,
      minlength: 8,
      maxlength: 1024,
      required: true,
    },
    address: {
      type: String,
    },
    kyc: {
      type: Boolean,
    },
    totalWon: { type: Number, required: false, default: 0.0 },
    totalLoss: { type: Number, required: false, default: 0.0 },
    // packageId: {
    //   type: Schema.Types.ObjectId,
    //   ref: "Plan",
    //   required: false,
    // },
    capital: {
      type: Number,
      default: 0.0,
      required: false,
    },
    accumulatingBalance: {
      type: Number,
      default: 0.0,
      required: false,
    },
    profits: {
      type: Number,
      default: 0.0,
      required: false,
    },
    accountNumber: {
      type: String,
      default: "",
      required: false,
    },
    accountName: {
      type: String,
      default: "",
      required: false,
    },
    bankName: {
      type: String,
      default: "",
      required: false,
    },
    swiftCode: {
      type: String,
      default: "",
      required: false,
    },
    bitcoinAddress: {
      type: String,
      default: "",
      required: false,
    },
    ethAddress: {
      type: String,
      default: "",
      required: false,
    },
    cashApp: {
      type: String,
      default: "",
      required: false,
    },
    payPalEmail: {
      type: String,
      default: "",
      required: false,
    },
    isActivated: { type: Boolean, default: true },
    package: {
      type: Object,
    },
    signal: { type: Object },
    referralCode: {
      type: String,
      minlength: 7,
    },
  },
  { timestamps: true }
);

userSchema.methods.generateToken = function () {
  const token = jwt.sign(
    {
      // id: this._id,
      isVerified: this.isVerified,
      role: this.role,
      userId: this._id,
    },
    process.env.CC_SECRET
  );
  return token;
};
const User = model("User", userSchema);

const tokenSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  token: {
    type: String,
    required: true,
  },
  expireAt: {
    type: Date,
    default: Date.now(),
    index: {
      expires: 86400000,
    },
  },
});

const Token = model("Token", tokenSchema);

User.syncIndexes();
Token.syncIndexes();

module.exports = { User, Token };
