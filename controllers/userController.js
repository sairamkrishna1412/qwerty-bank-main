const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.getMe = function (req, res, next) {
    req.params.id = req.user.id;
    next();
};

exports.getAllUser = catchAsync(async function (req, res, next) {
    const users = await User.find().select("+active");
    res.status(200).json({
        status: "success",
        results: users.length,
        data: {
            data: users,
        },
    });
});

exports.getUser = catchAsync(async function (req, res, next) {
    const user = await User.findById(req.params.id).select("+active");
    if (!user) return next(new AppError("No user with that ID", 404));
    res.status(200).json({
        status: "success",
        data: {
            data: user,
        },
    });
});

exports.createUser = catchAsync(async function (req, res, next) {
    const user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        role: req.body.role,
        active: true,
    });
    res.status(200).json({
        status: "success",
        data: {
            data: user,
        },
    });
});

exports.updateUser = catchAsync(async function (req, res, next) {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    }).select("+active");
    if (!user) {
        return next(new AppError("No user with that ID", 404));
    }
    res.status(200).json({
        status: "success",
        data: {
            data: user,
        },
    });
});

exports.deleteUser = catchAsync(async function (req, res, next) {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
        return next(new AppError("No user with that ID", 404));
    }
    res.status(204).json({
        status: "success",
        data: null,
    });
});
