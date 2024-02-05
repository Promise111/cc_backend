const { Schema, model } = require("mongoose");

const walletSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 3,
      unique: true,
    },
    dollarAmount: {
      type: Number,
      required: true,
    },
    walletAddress: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);
const Wallet = model("wallet", walletSchema);

Wallet.syncIndexes();

module.exports = Wallet;
