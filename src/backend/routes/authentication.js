var express = require('express');
var passport = require('passport');
var router = express.Router();

const authenticationController = require('../controllers/authenticationController');

router.get('/login', authenticationController.login);

router.get('/register', authenticationController.register);

router.post('/login', passport.authenticate('local-signin',
  {
    successRedirect: '/dashboard',
    failureRedirect: '/login'
  }
));

router.post('/register', passport.authenticate('local-signup',
  {
    successRedirect: '/dashboard',
    failureRedirect: '/register'
  }
));

router.get('/logout', authenticationController.logout);


module.exports = router;