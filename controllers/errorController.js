function sendErrorDev(err, req, res) {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        error: err,
        stack: err.stack,
    });
}
module.exports = function (err, req, res, next) {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "fail";
    sendErrorDev(err, req, res);
    // if (process.env.NODE_ENV == "development") {
    //     sendErrorDev(err, req, res);
    // }
};
