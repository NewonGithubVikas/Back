const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    transaction_type: {
      type: String,
      enum: ["credit", "withdraw"], // Only "add" or "withdraw" are allowed
      required: true,
    },
    transaction_date: {
      type: Date,
      default: Date.now, // Automatically set the current date and time
    },
  },
  { timestamps: true } // Automatically add createdAt and updatedAt fields
);

const Transaction = mongoose.model("Transaction", TransactionSchema);

module.exports = Transaction;
