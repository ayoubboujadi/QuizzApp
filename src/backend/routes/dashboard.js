var express = require('express');
var router = express.Router();
var utils = require('../utils/general-utils');

const dashboardController = require('../controllers/dashboardController');

const asyncMiddleware = fn =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .catch(next);
  };

/*function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/login');
}*/

router.get('/dashboard', utils.isUserLoggedIn, dashboardController.dashboard);

module.exports = router;