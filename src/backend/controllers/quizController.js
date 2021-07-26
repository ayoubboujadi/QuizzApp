const { Question, Quiz, CandidateSubmission } = require('../models');
var QuestionServiceFactory = require('../services/quizzes/quizService')
const moment = require('moment');

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
        var questionService = QuestionServiceFactory.make(q.questionType, q);
        var question = questionService.getQuestionResponse();
        questions.push(question);
    });

    quiz.questions = questions;
    res.render('quiz/quiz-edit', { quiz });
}

exports.updateQuiz = async (req, res, next) => {
    const { quiz } = req.body;
    const currentUserId = req.user.id;
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
    });


    var validationMessages = [];
    // Validate both the new and updated questions
    questionsToInsert.concat(questionsToUpdate).forEach(q => {
        var questionService = QuestionServiceFactory.make(q.questionType, q);
        var validationResult = questionService?.validateQuestion();
        if (validationResult != null)
            validationMessages.push(validationResult);
    });
    if (validationMessages.length > 0) {
        res.json({
            success: false,
            messages: validationMessages
        });
        return;
    }

    // Find which questions should be deleted
    dbQuestions.forEach(dbQ => {
        var relatedQuestion = quiz.questions?.find(x => x.id == dbQ.id);
        if (!relatedQuestion) {
            questionsToDelete.push(dbQ);
        }
    });

    // Insert the new questions
    questionsToInsert.forEach(async q => {
        // quizId, questionType, questionText, points, useQuestionPoints, answersData, questionData
        var answersData = q.answers;
        var temp = {
            quizId: dbQuiz.id, questionType: q.questionType, questionText: q.text, points: q.points, useQuestionPoints: q.useQuestionPoints,
            answersData: answersData
        };
        var createdQuestion = await Question.create(temp);
    });

    // Update old questions
    questionsToUpdate.forEach(async q => {
        // quizId, questionType, questionText, points, useQuestionPoints, answersData, questionData
        var relatedDbQuestion = dbQuestions?.find(x => x.id == q.id);
        if (relatedDbQuestion) {
            relatedDbQuestion.answersData = q.answers;
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
    if (quiz.timeLimitMinutes > 0)
        dbQuiz.timeLimitMinutes = quiz.timeLimitMinutes;
    else dbQuiz.timeLimitMinutes = null;

    await dbQuiz.save({ fields: ['name', 'description', 'timeLimitMinutes'] });

    res.json({
        success: true,
        name: dbQuiz.name,
        description: dbQuiz.description
    });
}

exports.listQuizzes = async (req, res, next) => {
    const currentUserId = req.user.id;
    var quizzes = await Quiz.findAll({ where: { userId: currentUserId }, include: [CandidateSubmission, Question] });

    for (let i = 0; i < quizzes.length; i++) {
        const quiz = quizzes[i];

        quiz.assignedCount = quiz.CandidateSubmissions.length;
        quiz.questionsCount = quiz.Questions.length;
        quiz.finishedCount = 0;
        quiz.startedCount = 0;
        for (let j = 0; j < quiz.CandidateSubmissions.length; j++) {
            const submission = quiz.CandidateSubmissions[j];
            if (submission.isFinished) {
                quiz.finishedCount++;
            }
            if (submission.isStarted) {
                quiz.startedCount++;
            }
        }
    }

    res.render('quiz/quiz-list', { quizzes, moment });
}