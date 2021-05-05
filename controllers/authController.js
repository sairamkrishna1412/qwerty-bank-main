const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");

const User = require("../models/userModels");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

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

    createAndSendJWT(user, 201, req, res);
});

exports.login = async function (req, res, next) {
    //1.get user details
    const { email, password } = req.body;
    if (!email || !password)
        next(new AppError("Please provide email and password", 400));

    //2. check if user exists
    const user = await User.findOne({ email: email }).select("+password");
    if (!user) next(new AppError("user does not exist. Please sign up", 404));

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
