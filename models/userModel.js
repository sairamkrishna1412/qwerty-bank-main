const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"],
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        unique: [true, "Account with that email already exists. please login."],
        validate: [validator.isEmail, "please enter a valid Email ID"],
    },
    photo: {
        type: String,
        default: "default.png",
    },
    role: {
        type: String,
        enum: {
            values: ["admin", "user"],
            message: "role is not available.",
        },
        default: "user",
    },
    password: {
        type: String,
        required: [true, "please enter a password"],
        minlength: 8,
        select: false,
    },
    confirmPassword: {
        type: String,
        required: [true, "please confirm your password"],
        minlength: 8,
        validate: {
            validator: function (cpass) {
                return cpass === this.password;
            },
            message: "Passwords do not match.",
        },
    },
    // balance: {
    //     type: Number,
    //     default: 10000,
    // },
    transactions: {
        total: {
            type: Number,
            default: 0,
        },
        credit: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Transaction",
            },
        ],
        debit: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Transaction",
            },
        ],
    },
    passwordChangedAt: {
        type: Date,
    },
    passwordResetExpires: Date,
    passwordResetToken: String,
    active: {
        type: Boolean,
        default: false,
        select: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    //encrypt password with cost 12 and remove confirm password
    this.password = await bcrypt.hash(this.password, 12);
    this.confirmPassword = undefined;
    next();
});

userSchema.pre("save", function (next) {
    if (!this.isModified("password") || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
});

userSchema.methods.checkPassword = async function (
    givenPassword,
    encryptedPassword
) {
    return await bcrypt.compare(givenPassword, encryptedPassword);
};

userSchema.methods.changedPassword = function (JWTTimeStamp) {
    //check if user changed password
    if (this.passwordChangedAt) {
        const passwordChangedAtTimeStamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        );
        return passwordChangedAtTimeStamp > JWTTimeStamp;
    }
    return false;
};

userSchema.methods.saveResetToken = async function (hash) {
    this.passwordResetToken = hash;
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    await this.save({
        validateBeforeSave: false,
    });
};

const User = mongoose.model("User", userSchema);

module.exports = User;
