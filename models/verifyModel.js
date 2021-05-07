const mongoose = require("mongoose");
const User = require("../models/userModel");

const verifySchema = new mongoose.Schema({
    hash: {
        type: String,
        requried: true,
    },
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        unique: true,
    },
    verified: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        expires: 900,
        default: Date.now,
    },
});

// console.log(verifySchema.path("createdAt").options);

// verifySchema.pre(
//     "deleteOne",
//     { document: true, query: false },
//     async function (next) {
//         console.log("pre remove function triggered.");
//         if (this.verified) next();
//         await User.deleteOne({ _id: this.userID });
//         next();
//     }
// );

const Verify = mongoose.model("Verify", verifySchema);

module.exports = Verify;
