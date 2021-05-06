const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const mongoose = require("mongoose");
const ObjectId = require("mongodb").ObjectId;

const User = require("../models/userModel");
const Verify = require("../models/verifyModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { sendMail } = require("../utils/sendEmail");

function signToken(id) {
    return jwt.sign({ id: id }, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
}

function createAndSendJWT(user, statusCode, req, res) {
    const token = signToken(user.id);
    //removing user password from output.
    user.password = undefined;

    res.status(statusCode).json({
        status: "success",
        token,
        data: {
            user,
        },
    });
}

async function createVerifyToken(user) {
    const randomBytes = crypto.randomBytes(64).toString("hex");
    const hash = crypto.createHash("sha256").update(randomBytes).digest("hex");
    await Verify.create({
        hash,
        userID: user.id,
    });
    return randomBytes;
}

exports.signup = catchAsync(async function (req, res, next) {
    const user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        role: req.body.role,
    });
    if (!user)
        next(new AppError("Something went wrong! please try again.", 400));

    const verifyToken = await createVerifyToken(user);
    const url = `${req.protocol}://${req.get(
        "host"
    )}/users/verify/${verifyToken}`;
    await sendMail(user, url, "verify");

    res.status(200).json({
        status: "success",
        data: {
            message: `Sent verfication link to ${user.email}. please send get request to that url`,
        },
    });
});

exports.verifySignup = catchAsync(async function (req, res, next) {
    if (!req.params.token) {
        return next(new AppError("Verification token is missing", 400));
    }

    const encryptedToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

    const verified = await Verify.findOneAndUpdate(
        { hash: encryptedToken },
        { verfied: true },
        { new: true }
    );
    if (!verified)
        return next(new AppError("Token is manipulated. try again!"));

    const user = await User.findByIdAndUpdate(
        verified.userID,
        { active: true },
        { new: true }
    );

    const url = `${req.protocol}://${req.get("host")}/`;
    sendMail(user, url, "welcome");
    createAndSendJWT(user, 201, req, res);
});

exports.login = async function (req, res, next) {
    //1.get user details
    const { email, password } = req.body;
    if (!email || !password)
        next(new AppError("Please provide email and password", 400));

    //2. check if user exists
    const user = await User.findOne({ email: email }).select("+password");
    if (!user || !user.active)
        next(new AppError("user does not exist. Please sign up", 404));

    //3.check if passwords match
    const passMatch = await user.checkPassword(password, user.password);
    if (!passMatch)
        next(new AppError("Incorrect Password. please try again", 400));

    //2.send jwt token after authenticating.
    createAndSendJWT(user, 200, req, res);
};

exports.logout = async function (req, res, next) {
    res.cookie("jwt", "logout", {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });
    res.status(200).json({ status: "success" });
};

exports.protect = async function (req, res, next) {
    let token;
    //1.check if jwt token is present
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token)
        next(
            new AppError("you are not authorized. please log in to continue.")
        );

    //2.check token
    const decoded = await promisify(jwt.verify)(
        token,
        process.env.JWT_SECRET_KEY
    );
    if (!decoded)
        next(
            new AppError("you are not authorized. please log in to continue.")
        );

    //3.check if user changed password after issue of token.
    const user = await User.findById(decoded.id);

    if (!user)
        next(new AppError("This user is deleted. please login / sign up"));

    const changedPassword = user.changedPassword(decoded.iat);
    if (changedPassword)
        next(new AppError("Session expired. please log in again"));

    //GRANT PERMISSION ONLY IF ALL CONDITIONS ARE SATISFIED
    res.user = user;
    res.locals.user = user;
    next();
};

exports.forgotPassword = function (req, res, next) {};

exports.resetPassword = function (req, res, next) {};

//Grant permission to certain resoures to only authorized personnel
//in middleware we call this is how we call it : app.use(restrictTo("users"))
//restrictTo("users") then returns another function which doesn't get called away. but is invoked when a new request is made to a protected route.
exports.restrictTo = function (...roles) {
    return function (req, res, next) {
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError(
                    "You are not authorized to perform this action",
                    401
                )
            );
        }
        next();
    };
};
