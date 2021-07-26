var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bodyParser = require('body-parser')
const expressValidator = require('express-validator')
var passport = require('passport');
var session = require('express-session')
var flash = require('connect-flash');


// Import the routes
var indexRouter = require('./routes/index');
var quizRouter = require('./routes/quiz');
var candidateRouter = require('./routes/candidate');
var authenticationRouter = require('./routes/authentication');
var dashboardRouter = require('./routes/dashboard');
var submissionRouter = require('./routes/submission');

// load passport strategies
require('./config/passport')(passport);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json())
//app.use(expressValidator())

// For Passport (authentication)
app.use(session({ secret: 'keyboard cat', resave: true, saveUninitialized: true })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

// For flash messages
app.use(flash());

// Make the user object available to EJS
app.use(function (req, res, next) {
  res.locals.user = req.user;
  next();
});

// Register all the routes
app.use('/quiz', quizRouter);
app.use('/candidate', candidateRouter);
app.use('/submission', submissionRouter);
app.use('/', dashboardRouter);
app.use('/', authenticationRouter);
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

//Sync Database
/* require('./models').sequelize.sync().then(function() {
    console.log('Nice! Database looks fine')
}).catch(function(err) {
    console.log(err, "Something went wrong with the Database Update!")
}); */

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
