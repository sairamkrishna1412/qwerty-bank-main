const express = require("express");

const transactionController = require("../controllers/trasactionController");
const authController = require("../controllers/authController");

const router = express.Router();

router.use(authController.protect);

router.post("/new", transactionController.newTransaction);
router.get("/my-transactions", transactionController.myTransactions);

router.use(authController.restrictTo("admin"));
router
    .route("/")
    .post(transactionController.createTransaction)
    .get(transactionController.getAllTransactions);

router
    .route("/:id")
    .get(transactionController.getTransaction)
    // .patch(transactionController.updateTransaction)
    .delete(transactionController.deleteTransaction);
module.exports = router;
