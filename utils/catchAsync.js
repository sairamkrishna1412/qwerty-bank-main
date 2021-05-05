module.exports = function (fn) {
    return function (req, res, next) {
        fn(req, res, next).catch(function (err) {
            return next(err);
        });
    };
};
