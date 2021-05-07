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

function createRandomHash(len = 64, alg = "sha256") {
    const randomBytes = crypto.randomBytes(64).toString("hex");
    const hash = crypto.createHash("sha256").update(randomBytes).digest("hex");
    return [randomBytes, hash];
}

function createUrl(req, path) {
    const url = `${req.protocol}://${req.get("host")}${path}`;
    return url;
}

async function createVerifyToken(user) {
    const [randomBytes, hash] = createRandomHash();
    const verify = await Verify.create({
        hash,
        userID: user.id,
    });
    return randomBytes;
}

exports.signup = catchAsync(async function (req, res, next) {
    let user;
    user = await User.findOne({ email: req.body.email }).select("+active");
    if (user) {
        user.password = req.body.password;
        user.confirmPassword = req.body.confirmPassword;
        await user.save();
    }
    if (!user)
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            confirmPassword: req.body.confirmPassword,
            role: req.body.role,
        });
    if (!user)
        return next(
            new AppError("Something went wrong! please try again.", 400)
        );

    if (user.active)
        return next(new AppError("User with this mail already exists.", 400));

    const verifyExists = await Verify.findOne({ userID: user.id });
    if (verifyExists)
        return next(
            new AppError(
                "we've already sent a verfication email which is still valid. please check your email."
            )
        );

    const verifyToken = await createVerifyToken(user);
    // const url = `${req.protocol}://${req.get(
    //     "host"
    // )}/users/verify/${verifyToken}`;
    const url = createUrl(req, `/users/verify/${verifyToken}`);
    await sendMail(user, url, "verify");

    res.status(200).json({
        status: "success",
        data: {
            message: `Sent verfication link to ${user.email}. please send get request to that url. Verfication link valid for 15 mins.`,
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
        { verified: true },
        { new: true }
    );
    // console.log(verified);
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
        return next(new AppError("Please provide email and password", 400));

    //2. check if user exists
    const user = await User.findOne({ email: email }).select(
        "+password +active"
    );
    if (!user || !user.active)
        return next(new AppError("User does not exist. Please sign up", 404));

    //3.check if passwords match
    const passMatch = await user.checkPassword(password, user.password);
    if (!passMatch)
        return next(new AppError("Incorrect Password. please try again", 400));

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

exports.protect = catchAsync(async function (req, res, next) {
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
        return next(
            new AppError("you are not authorized. please log in to continue.")
        );

    //2.check token
    const decoded = await promisify(jwt.verify)(
        token,
        process.env.JWT_SECRET_KEY
    );
    if (!decoded)
        return next(
            new AppError("you are not authorized. please log in to continue.")
        );

    //3.check if user changed password after issue of token.
    const user = await User.findById(decoded.id);

    if (!user)
        return next(
            new AppError("This user is deleted. please login / sign up")
        );

    const changedPassword = user.changedPassword(decoded.iat);
    if (changedPassword)
        return next(new AppError("Session expired. please log in again"));

    //GRANT PERMISSION ONLY IF ALL CONDITIONS ARE SATISFIED
    res.user = user;
    res.locals.user = user;
    next();
});

exports.forgotPassword = catchAsync(async function (req, res, next) {
    //1.check if user exists and active
    const { email } = req.body;
    if (!email) return next(new AppError("Please provide an email", 400));

    const user = await User.findOne({ email }).select("+active");
    console.log(user);
    if (!user || !user.active) {
        return next(new AppError("No user found.", 404));
    }
    //2.create random hash
    const [randomBytes, hash] = createRandomHash();
    await user.saveResetToken(hash);

    //3.send random hash to user
    const url = createUrl(req, `/users/resetPassword/${randomBytes}`);
    console.log(url);

    await sendMail(user, url, "resetPassword");
    res.status(200).json({
        status: "success",
        data: {
            message: `Sent Password Reset link to ${user.email}. please send patch request with password and confirm password to that url. Reset link valid for 10 mins`,
        },
    });
});

exports.resetPassword = catchAsync(async function (req, res, next) {
    const { token } = req.params;
    if (!token) return new AppError("Please enter a valid token");

    const encryptedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    const user = await User.findOne({ passwordResetToken: encryptedToken });

    if (!user) return next(new AppError("Invalid Reset link.", 400));

    if (user.passwordResetExpires.getTime() < new Date().getTime())
        return next(
            new AppError(
                "This Reset link expired. please generate new password reset link.",
                400
            )
        );

    // const user = await User.findOne({
    //     passwordResetToken: encryptedToken,
    //     passwordResetExpires: {
    //         $gt: Date.now(),
    //     },
    // });
    // if (!user)
    //     return next(
    //         new AppError(
    //             "Invalid Reset link. please generate new password reset link.",
    //             400
    //         )
    //     );

    const { password, confirmPassword } = req.body;

    user.password = password;
    user.confirmPassword = confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    createAndSendJWT(user, 200, req, res);
});

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
