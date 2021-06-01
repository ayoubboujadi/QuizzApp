var express = require('express');
var router = express.Router();
var utils = require('../utils/general-utils');

const quizController = require('../controllers/quizController');
const quizValidator = require('../validators/quizValidator');

const asyncMiddleware = fn =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .catch(next);
  };


// Returns the basic HTML page that has quiz creation form
router.get('/create', utils.isUserLoggedIn, quizController.createQuizPage);

// Saves new quiz to the database from form-data
router.post('/create', utils.isUserLoggedIn, quizValidator.validateQuiz, asyncMiddleware(quizController.createQuiz));

// Retruns the basic HTML page that has the quiz editing form
router.get('/edit/:id', utils.isUserLoggedIn, asyncMiddleware(quizController.editQuiz));

// Updates a single quiz's details in the database
router.post('/update', utils.isUserLoggedIn, asyncMiddleware(quizController.updateQuiz));

router.get('/list', utils.isUserLoggedIn, asyncMiddleware(quizController.listQuizzes));

module.exports = router;