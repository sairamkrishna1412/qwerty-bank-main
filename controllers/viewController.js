exports.getOverview = function (req, res, next) {
    res.status(200).render("overview", {
        title: "welcome",
    });
};

exports.getLoginForm = function (req, res) {
    res.status(200).render("login", {
        title: "Login",
    });
};

exports.getSignupForm = function (req, res) {
    res.status(200).render("signup", {
        title: "Sign up",
    });
};

exports.getUser = function (req, res) {
    const user = req.user;
    const credit = user.transactions.credit;
    const debit = user.transactions.debit;

    let creditTotal = 0;
    let debitTotal = 0;

    credit.forEach((el) => {
        creditTotal += el.amount;
        el.type = "credit";
    });
    debit.forEach((el) => {
        debitTotal += el.amount;
        el.type = "debit";
    });

    const transactions = credit.concat(debit);

    //sorting in desending order
    transactions.sort(function (a, b) {
        return b.date - a.date;
    });

    res.status(200).render("user", {
        title: "Account",
        user,
        creditTotal,
        debitTotal,
        transactions,
    });
};

exports.getProfile = function (req, res) {
    res.status(200).render("user-profile");
};
