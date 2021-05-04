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
        default: "default.jpg",
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
    passwordChangedAt: {
        type: Date,
    },
    passwordResetExpires: Date,
    passwordResetToken: String,
    active: {
        type: Boolean,
        default: true,
        select: false,
    },
});

const User = mongoose.model("User", userSchema);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    //encrypt password with cost 12 and remove confirm password
    this.password = await bcrypt.hash(this.password, 12);
    this.confirmPassword = undefined;
    next();
});

module.exports = User;
