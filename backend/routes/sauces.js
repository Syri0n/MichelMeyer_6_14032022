const express = require("express");
const router = express.Router();

const sauceCtrl = require("../controllers/sauces");
const auth = require("../middleware/auth");

router.post("/", auth, sauceCtrl.createSauce);
router.put("/:id", auth, sauceCtrl.modifySauce);
router.delete("/:id", auth, sauceCtrl.deleteSauce);
router.get("/:id", auth, sauceCtrl.findOneSauce);
router.use("/", auth, sauceCtrl.getAllSauce);

module.exports = router;
