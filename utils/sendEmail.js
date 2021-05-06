const sendGrid = require("@sendgrid/mail");
const path = require("path");
const pug = require("pug");
const AppError = require("./appError");

// console.log(`${__dirname}/../views/emails/welcome`);

sendGrid.setApiKey(process.env.SENDGRID_API_KEY);

exports.sendMail = async function (user, url, type) {
    let subject;
    switch (type) {
        case "verify":
            subject = "Account verification link";
            break;
        case "welcome":
            subject = "Welcome to Qwerty Bank!";
            break;
        case "resetPassword":
            subject = "Reset password link";
            break;
    }

    const html = pug.renderFile(`${__dirname}/../views/emails/${type}.pug`, {
        subject,
        firstName: user.name,
        url,
    });
    const msg = {
        to: user.email,
        from: "sai ram krishna <sairamkrishna1412@gmail.com>",
        subject,
        html,
    };
    sendGrid
        .send(msg)
        .then(() => {
            console.log("sent sendgrid mail.");
        })
        .catch((err) => {
            console.error(err);
            console.log(err.stack);
        });
};

// exports.sendMail = async function (req, res, next) {
//     const sent = await sendGrid.send(msg);
//     if (!sent) return next(new AppError("Couldn't send mail", 400));

//     res.status(202).json({
//         status: "success",
//         data: {
//             sent,
//         },
//     });
// };
