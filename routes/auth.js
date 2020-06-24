var express = require("express");
var router = express.Router();

var authcontroler = require("../controlers/auth");

/* GET home page. */
router.post("/add/:username", authcontroler.loginpost);

router.get("/:username", authcontroler.loginget);

module.exports = router;
