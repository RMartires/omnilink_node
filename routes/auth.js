var express = require('express');
var router = express.Router();

var authcontroler = require('../controlers/auth');

/* GET home page. */
router.get('/:username', authcontroler.login);

module.exports = router;
