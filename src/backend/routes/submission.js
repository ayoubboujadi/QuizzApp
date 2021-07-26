var express = require('express');
var router = express.Router();
var utils = require('../utils/general-utils');

const asyncMiddleware = fn =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .catch(next);
  };

const submissionController = require('../controllers/submissionController');

router.get('/start/:token', submissionController.startQuiz);

router.get('/take/:token', submissionController.takeQuiz);

router.get('/end/:token', asyncMiddleware(submissionController.end));

router.post('/save-results/:token', asyncMiddleware(submissionController.saveResults));

module.exports = router;