var express = require("express");
var router = express.Router();

var indexControler = require("../controlers/index");

/* GET home page. */
router.get("/:name", indexControler.sendimage);

module.exports = router;
