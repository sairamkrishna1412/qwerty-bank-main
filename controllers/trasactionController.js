const User = require("../models/userModel");
const Transaction = require("../models/transactionModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

function CalcTotal(prevTotal, num) {
    return prevTotal + num;
}

exports.newTransaction = catchAsync(async function (req, res, next) {
    const recipentEmail = req.body.email;
    const amount = req.body.amount;
    const remarks = req.body.remarks;
    if (!recipentEmail)
        return next(new AppError("Enter a recipient email Id", 400));
    if (!amount) return next(new AppError("Enter amount", 400));

    const sender = await User.findById(req.user.id);
    if (!sender) return next(new AppError("Sender error"));

    const recipient = await User.findOne({ email: recipentEmail });
    if (!recipient) return next(new AppError("Recipient does not exist", 400));

    if (sender.email === recipient.email)
        return next(new AppError("You cannot send money to yourself.", 400));

    //check if sender balance is greater than amount
    if (amount <= 0) return next(new AppError("Minimum amount is 1 Rs", 400));
    if (sender.transactions.total < amount)
        return next(
            new AppError("Amount cannot be greater than your balance", 400)
        );

    const transaction = await Transaction.create({
        sender: sender.id,
        recipient: recipient.id,
        amount,
        remarks,
    });

    //update transactions array of sender and recipient
    sender.transactions.debit.push(transaction);
    recipient.transactions.credit.push(transaction);

    //update totals of sender and recipient
    sender.transactions.total = CalcTotal(sender.transactions.total, -amount);
    recipient.transactions.total = CalcTotal(
        recipient.transactions.total,
        amount
    );

    await sender.save({ validateBeforeSave: false });
    await recipient.save({ validateBeforeSave: false });

    res.status(200).json({
        status: "success",
        data: {
            transaction,
        },
    });
});

exports.myTransactions = catchAsync(async function (req, res, next) {
    const user = await User.findById(req.user.id)
        .populate("transactions.credit")
        .populate("transactions.debit");

    const credit = user.transactions.credit;
    const debit = user.transactions.debit;

    credit.forEach((el) => {
        el.type = "credit";
    });
    debit.forEach((el) => {
        el.type = "debit";
    });

    const allTransactions = credit.concat(debit);
    allTransactions.sort(function (a, b) {
        return b.date - a.date;
    });

    res.status(200).json({
        status: "success",
        results: allTransactions.length,
        data: {
            transactions: allTransactions,
        },
    });
});

exports.createTransaction = catchAsync(async function (req, res, next) {
    const sender = await User.findById(req.body.senderID);
    const recipient = await User.findById(req.body.recipientID);
    const amount = req.body.amount;
    if (!sender) return next(new AppError("sender doesn't exist"));
    if (!recipient) return next(new AppError("recipient doesn't exist"));

    const transaction = await Transaction.create({
        sender: req.body.senderID,
        recipient: req.body.recipientID,
        amount,
        remarks: req.body.remarks,
    });

    if (!transaction) {
        return next(
            new AppError(
                "Some fields are wrong please re-check & try again.",
                404
            )
        );
    }
    //update transactions array of sender and recipient
    sender.transactions.debit.push(transaction);
    recipient.transactions.credit.push(transaction);

    //update totals of sender and recipient
    sender.transactions.total = CalcTotal(sender.transactions.total, -amount);
    recipient.transactions.total = CalcTotal(
        recipient.transactions.total,
        amount
    );

    await sender.save({ validateBeforeSave: false });
    await recipient.save({ validateBeforeSave: false });

    res.status(200).json({
        status: "success",
        data: {
            data: transaction,
        },
    });
});
exports.getAllTransactions = catchAsync(async function (req, res, next) {
    const transactions = await Transaction.find();
    res.status(200).json({
        status: "success",
        results: transactions.length,
        data: {
            data: transactions,
        },
    });
});

exports.getTransaction = catchAsync(async function (req, res, next) {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
        return next(new AppError("No transaction with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            data: transaction,
        },
    });
});
// exports.updateTransaction = catchAsync(async function (req, res, next) {
//     const transaction = await Transaction.findByIdAndUpdate(
//         req.params.id,
//         req.body,
//         {
//             new: true,
//             runValidators: true,
//         }
//     );
//     if (!transaction) {
//         return next(new AppError("No transaction with that ID", 404));
//     }

//     res.status(200).json({
//         status: "success",
//         data: {
//             data: transaction,
//         },
//     });
// });
exports.deleteTransaction = catchAsync(async function (req, res, next) {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);
    if (!transaction) {
        return next(new AppError("No transaction with that ID", 404));
    }
    const sender = await User.findById(transaction.sender);
    const recipient = await User.findById(transaction.recipient);

    // const senderTransactionIndex = sender.tranactions.debit.indexOf(transaction.id);
    // const recipentTransactionIndex = recipient.tranactions.credit.indexOf(transaction.id);
    sender.transactions.debit.filter((item) => item !== transaction.id);
    recipient.transactions.credit.filter((item) => item !== transaction.id);

    sender.transactions.total = CalcTotal(
        sender.transactions.total,
        transaction.amount
    );

    recipient.transactions.total = CalcTotal(
        recipient.transactions.total,
        -transaction.amount
    );

    await sender.save({ validateBeforeSave: false });
    await recipient.save({ validateBeforeSave: false });

    res.status(204).json({
        status: "success",
        data: null,
    });
});
