var utils = require('../utils/general-utils');

exports.login = (req, res, next) => {
    if (req.isAuthenticated()) {
        res.redirect('/');
        return;
    }

    res.render('authentication/login');
}

exports.register = (req, res, next) => {
    res.render('authentication/register');
}

exports.logout = (req, res, next) => {
    req.session.destroy(function (err) {
        res.redirect('/login');
    });
}