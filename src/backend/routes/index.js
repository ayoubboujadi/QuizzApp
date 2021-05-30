var express = require('express');
var router = express.Router();
const Quiz = require('../models').Quiz;

/* GET home page. */
router.get('/', async function(req, res, next) {
  res.render('quiz/index', { title: 'Express ' });
});

module.exports = router;
