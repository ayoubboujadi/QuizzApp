const {check, validationResult} = require('express-validator');

exports.validateQuiz = [
  check('name')
    .trim()
    .escape()
    .not()
    .isEmpty()
    .withMessage('Quiz name can not be empty!')
    .bail()
    .isLength({min: 5})
    .withMessage('Minimum 5 characters required!')
    .bail(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({errors: errors.array()});
    next();
  },
];