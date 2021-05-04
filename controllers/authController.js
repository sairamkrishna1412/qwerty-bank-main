const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const User = require("../models/userModels");

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

exports.signup = async function (req, res, next) {
    try {
        const user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            confirmPassword: req.body.confirmPassword,
            role: req.body.role,
        });

        createAndSendJWT(user, 201, req, res);
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: err.message,
            error: err,
            stack: err.stack,
        });
        // console.log(err);
        next();
    }
};
exports.login = function () {};
