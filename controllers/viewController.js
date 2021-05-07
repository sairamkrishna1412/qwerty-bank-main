exports.getOverview = function (req, res, next) {
    res.status(200).render("overview");
};

exports.getLoginForm = function (req, res) {
    res.status(200).render("login");
};

exports.getSignupForm = function (req, res) {
    res.status(200).render("signup");
};
