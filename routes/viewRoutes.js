const express = require("express");
const viewController = require("../controllers/viewController");

const router = express.Router();

router.get("/", viewController.getOverview);
router.get("/login", viewController.getLoginForm);
router.get("/signup", viewController.getSignupForm);

module.exports = router;
