const { Schema, model } = require("mongoose");

const signalSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 3,
      unique: true,
    },
    oldPrice: { type: Number, required: true },
    price: {
      type: Number,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);
const Signal = model("Signal", signalSchema);

Signal.syncIndexes();

model.exports = Signal;
