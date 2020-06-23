var express = require("express");
var router = express.Router();

var indexControler = require("../controlers/index");

/* GET home page. */
router.get("/", indexControler.test);

module.exports = router;
