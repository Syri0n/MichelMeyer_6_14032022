const express = require("express");
const router = express.Router();

const sauceCrtl = require("../controllers/sauces");
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");

router.post("/", auth, multer, sauceCrtl.createSauce);
router.put("/:id", auth, multer, sauceCrtl.modifySauce);
router.delete("/:id", auth, sauceCrtl.deleteSauce);
router.get("/:id", auth, sauceCrtl.getOneSauce);
router.get("/", auth, sauceCrtl.getAllSauce);

module.exports = router;
