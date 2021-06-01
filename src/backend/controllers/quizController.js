const { Question, Quiz } = require('../models');
var QuestionServiceFactory = require('../services/quizzes/quizService')

exports.createQuizPage = async (req, res, next) => {
    console.log('createQuizPage session user', req.session.user);
    res.render('quiz/quiz-create');
}

exports.createQuiz = async (req, res, next) => {
    const { name, description } = req.body;

    const currentUserId = req.user.id;

    var quiz = {
        name, description, userId: currentUserId
    };

    var createdQuiz = await Quiz.create(quiz);

    res.redirect("/quiz/edit/" + createdQuiz.id);
}

exports.editQuiz = async (req, res, next) => {
    const quizId = req.params.id;
    const currentUserId = req.user.id;

    var quiz = await Quiz.findOne({ where: { id: quizId, userId: currentUserId }, raw: true });

    if (!quiz) {
        res.render('404');
        return;
    }


    var quizQuestions = await Question.findAll({ where: { quizId }, raw: true });
    var questions = [];
    quizQuestions.forEach(q => {
        var questionService = QuestionServiceFactory.make(q.type, q);
        console.log('questionService: ', questionService);
        var question = questionService.getQuestionResponse();

        /*         var question = {
                    'id': q.id,
                    'isNew': false,
                    'isEditing': false,
                    'type': q.questionType,
                    'text': q.questionText,
                    'points': q.points,
                    'useQuestionPoints': q.useQuestionPoints,
                    'correctAnswer': null,
                    'answers': JSON.parse(q.answersData)
                };
        
                if (!question.answers) {
                    question.answers = [];
                }
        
                var correctAnswer = question.answers.find(x => x.isCorrect);
                console.log('correctAnswer', correctAnswer);
                question.correctAnswer = correctAnswer.valueId; */
        console.log('question', question);

        questions.push(question);
    });

    quiz.questions = questions;
    res.render('quiz/quiz-edit', { quiz });
}

exports.updateQuiz = async (req, res, next) => {
    const { quiz } = req.body;
    const currentUserId = req.user.id;
    console.log('quiz', quiz);
    var dbQuiz = await Quiz.findOne({ where: { id: quiz.id, userId: currentUserId } });

    if (!dbQuiz) {
        res.render('404');
        return;
    }

    // select all the questions from the DB
    var dbQuestions = await Question.findAll({ where: { quizId: quiz.id } });

    // find which questions should be inserted, and which ones should be updated
    var questionsToInsert = [], questionsToUpdate = [], questionsToDelete = [];
    quiz.questions.forEach(q => {
        if (q.isNew)
            questionsToInsert.push(q);
        else
            questionsToUpdate.push(q);
    }
    );

    // find which questions should be deleted
    dbQuestions.forEach(dbQ => {
        var relatedQuestion = quiz.questions?.find(x => x.id == dbQ.id);
        if (!relatedQuestion) {
            questionsToDelete.push(dbQ);
        }
    });

    console.log('@@@ questionsToInsert: ', questionsToInsert);
    console.log('@@@ questionsToUpdate: ', questionsToUpdate);
    console.log('@@@ questionsToDelete: ', questionsToDelete);

    // Insert the new questions
    questionsToInsert.forEach(async q => {
        // quizId, questionType, questionText, points, useQuestionPoints, answersData, questionData
        var answersData = JSON.stringify(q.answers);
        var temp = {
            quizId: dbQuiz.id, questionType: q.type, questionText: q.text, points: q.points, useQuestionPoints: q.useQuestionPoints,
            answersData: answersData
        };
        var createdQuestion = await Question.create(temp);
    });

    // Update old questions
    questionsToUpdate.forEach(async q => {
        // quizId, questionType, questionText, points, useQuestionPoints, answersData, questionData
        var relatedDbQuestion = dbQuestions?.find(x => x.id == q.id);
        if (relatedDbQuestion) {
            relatedDbQuestion.answersData = JSON.stringify(q.answers);
            relatedDbQuestion.questionText = q.text;
            relatedDbQuestion.points = q.points;
            relatedDbQuestion.useQuestionPoints = q.useQuestionPoints;
            await relatedDbQuestion.save({ fields: ['questionText', 'points', 'useQuestionPoints', 'answersData'] });
        }
    });

    // delete questions
    questionsToDelete.forEach(async q => {
        await q.destroy();
    });

    dbQuiz.name = quiz.name;
    dbQuiz.description = quiz.description;

    await dbQuiz.save({ fields: ['name', 'description'] });

    res.json({
        name: dbQuiz.name,
        description: dbQuiz.description
    });
}

exports.listQuizzes = async (req, res, next) => {
    const currentUserId = req.user.id;
    var quizzes = await Quiz.findAll({ where: { userId: currentUserId } });
    res.render('quiz/quiz-list', { quizzes });
}