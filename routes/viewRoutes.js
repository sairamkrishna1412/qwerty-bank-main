const express = require("express");
const viewController = require("../controllers/viewController");
const authController = require("../controllers/authController");

const router = express.Router();

router.get("/", viewController.getOverview);
router.get("/login", viewController.getLoginForm);
router.get("/signup", viewController.getSignupForm);
// router.get("/verify/:token", viewController.verifyUser);
// router.use(authController.isLoggedIn);
router.get("/account", authController.protect, viewController.getUser);
router.get("/profile", authController.protect, viewController.getProfile);
router.get(
    "/my-transactions",
    authController.protect,
    viewController.getTransactions
);
module.exports = router;
