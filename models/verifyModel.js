const mongoose = require("mongoose");

const verifySchema = new mongoose.Schema({
    hash: {
        type: String,
        requried: true,
    },
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        requried: true,
    },
    verified: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: 7200,
    },
});

const Verify = mongoose.model("Verify", verifySchema);

module.exports = Verify;
