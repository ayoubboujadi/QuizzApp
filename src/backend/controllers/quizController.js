const Quiz = require('../models').Quiz;

exports.createQuizPage = async (req, res, next) => {
    res.render('quiz/quiz-create');
}

exports.createQuiz = async (req, res, next) => {
    const { name, description } = req.body;

    // Should be extracted from the session
    const currentUserId = 1;

    var quiz = {
        name, description, userId: currentUserId
    };

    var createdQuiz = await Quiz.create(quiz);

    res.redirect("/quiz/edit/" + createdQuiz.id);
}

exports.editQuiz = async (req, res, next) => {
    const quizId = req.params.id;
    // Todo: validate if this quiz exists and belogs to the current signed in user

    var quiz = await Quiz.findOne({ where: { id: quizId } });

    res.render('quiz/quiz-edit', { quiz });
}

exports.updateQuiz = async (req, res, next) => {
    const { id, name, description } = req.body;

    var quiz = await Quiz.findOne({ where: { id } });

    quiz.name = name;
    quiz.description = description;

    await quiz.save({ fields: ['name', 'description'] });

    res.json({
        name: quiz.name,
        description: quiz.description
    });
}