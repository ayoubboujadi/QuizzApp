var express = require('express');
var router = express.Router();
var utils = require('../utils/general-utils');

const asyncMiddleware = fn =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .catch(next);
  };

const candidateController = require('../controllers/candidateController');

// Returns the basic HTML page that has quiz creation form
router.get('/create', utils.isUserLoggedIn, candidateController.createCandidatePage);

router.post('/create', utils.isUserLoggedIn, asyncMiddleware(candidateController.createCandidate));

router.post('/assign', utils.isUserLoggedIn, asyncMiddleware(candidateController.assignCandidate));

router.delete('/deleteSubmission/:submissionId', utils.isUserLoggedIn, asyncMiddleware(candidateController.deleteCandidateSubmission));

router.get('/list', utils.isUserLoggedIn, asyncMiddleware(candidateController.listCandidates));

router.get('/submissions/:candidateId', utils.isUserLoggedIn, asyncMiddleware(candidateController.candidateSubmissions));

router.get('/result/:submissionId', utils.isUserLoggedIn, asyncMiddleware(candidateController.candidateResult));

module.exports = router;