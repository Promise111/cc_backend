const { Schema, model } = require("mongoose");

const planSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 3,
      unique: true,
    },
    min: {
      type: Number,
      required: true,
    },
    max: {
      type: Number,
      required: true,
    },
    weeklyInterest: {
      type: String,
      required: true,
    },
    tradingCommission: {
      type: String,
      required: true,
    },
    referralBonus: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);
const Plan = model("Plan", planSchema);

Plan.syncIndexes();

model.exports = Plan;
