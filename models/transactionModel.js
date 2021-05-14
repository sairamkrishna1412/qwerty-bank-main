const mongoose = require("mongoose");
const validator = require("validator");

const transactionSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "A transaction must have sender"],
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "A transaction must have recipient"],
    },
    recipientEmail: {
        type: String,
        validate: [validator.isEmail, "Enter a valid recipient email id"],
        required: [true, "A transaction must have a recipient email"],
    },
    date: {
        type: Date,
        default: Date.now,
    },
    type: {
        type: String,
        enum: {
            values: ["credit", "debit"],
            message: "Transaction type can be either credit or debit",
        },
        default: undefined,
    },
    amount: {
        type: Number,
        required: [true, "Amount is a required field"],
    },
    remarks: {
        type: String,
        maxLength: 100,
    },
});

transactionSchema.pre("save", function (next) {
    this.type = undefined;
    next();
});

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
