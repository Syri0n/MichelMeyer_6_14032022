const express = require("express");
const router = express.Router();

const userCtrl = require("../controllers/user");
const rateLimit = require("../middleware/rateLimit");

router.post("/signup", userCtrl.signup);
router.post("/login", rateLimit, userCtrl.login);

module.exports = router;
