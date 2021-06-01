

exports.asyncMiddleware = function asyncMiddleware(fn) {
    (req, res, next) => {
        Promise.resolve(fn(req, res, next))
            .catch(next);
    }
};

exports.isUserLoggedIn = function isUserLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/login');
}
