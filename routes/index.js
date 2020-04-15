var express = require('express');
var router = express.Router();

var indexcontroler = require('../controlers/index');

/* GET home page. */
router.get('/:code', indexcontroler.temp);

module.exports = router;
