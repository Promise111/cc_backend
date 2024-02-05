const { Schema, model } = require("mongoose");

const transactionSchema = new Schema(
  {
    transactionId: {
      type: String,
      required: true,
      minlength: 3,
      unique: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    transactionAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "failed", "success"],
      default: "pending",
    },
    type: {
      type: String,
      enum: ["withdrawal", "transfer", "deposit"],
      required: true,
    },
  },
  { timestamps: true }
);
const Transaction = model("Transaction", transactionSchema);

Transaction.syncIndexes();

module.exports = Transaction;
