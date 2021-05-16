const fs = require("fs");
const multer = require("multer");
const sharp = require("sharp");

const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

//create storage object that stores uploaded files in buffer. suitable only for small files. use diskStorage for large files
const multerStorage = multer.memoryStorage();

//multer filter which takes 3 params req, file, callback. callback(null, true) means accept file. callback(null,false) means reject file.
const multerFilter = function (req, file, callback) {
    if (file.mimetype.startsWith("image")) {
        callback(null, true);
    } else {
        callback(new AppError("Please upload only image", 400), false);
    }
};

//creating multer obj with multerStorage, multerFilter & limits.
const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
    limits: {
        fileSize: 5000000,
    },
});

//upload.single('photo') => single file upload input name attribute is "photo" from form is taken.
exports.uploadUserPhoto = upload.single("photo");

exports.resizeSavePhoto = catchAsync(async function (req, res, next) {
    //if uploadUserPhoto if file is accepted then it will be written to req.file.
    if (!req.file) return next();

    req.file.filename = `${req.user.id}-${Date.now()}.jpeg`;

    //resize format, and save file.
    await sharp(req.file.buffer)
        .rotate()
        .resize(500, 500)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/img/users/${req.file.filename}`);

    if (req.user.photo !== "default.png") {
        const existingProfilePath = `${__dirname}/../public/img/users/${req.user.photo}`;
        fs.unlink(existingProfilePath, (err) => {
            if (err) console.log(err);
        });
    }

    next();
});

const filterObj = function (obj, ...fields) {
    Object.keys(obj).forEach((el) => {
        if (!fields.includes(el)) delete obj[el];
    });
    return obj;
};

exports.updateMe = catchAsync(async function (req, res, next) {
    //if anything other than 'name'(ex : password) is on req.body we remove it by using filetObj function
    const filteredReq = filterObj(req.body, "name");

    // if file is uploaded and it succesfully passes through uploadUserPhoto and resizeSavePhoto then it will be present on req.file and
    // req.file.filename property is created in resizeSavephoto. we add just filename(not the whole file) to filtereq.photo and finally pass it to user.findbyidandupdate

    if (req.file) filteredReq.photo = req.file.filename;
    const user = await User.findByIdAndUpdate(req.user.id, filteredReq, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        status: "success",
        data: {
            user,
        },
    });
});

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
