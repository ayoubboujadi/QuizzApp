const User = require('../models').User;

exports.dashboard = (req, res, next) => {
    var flashMessage = req.flash('flash');
    res.render('dashboard', {flashMessage});
}

