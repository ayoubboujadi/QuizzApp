const { Candidate, Quiz, CandidateSubmission, Question } = require('../models');
var QuestionServiceFactory = require('../services/quizzes/quizService')
const moment = require('moment');

exports.startQuiz = async (req, res, next) => {
    const token = req.params.token;

    var submission = await CandidateSubmission.findOne({ where: { token }, raw: true })

    if (!submission) {
        // TODO: return 404
    }

    if (submission.isStarted == 1 && submission.dateStarted != null) {
        res.redirect("/submission/take/" + token);
        return;
    }

    if (submission.isFinished == 1) {
        res.redirect("/submission/end/" + token);
        return;
    }

    var candidate = await Candidate.findOne({ where: { id: submission.candidateId } });
    var quiz = await Quiz.findOne({ where: { id: submission.quizId } });

    res.render('submission/quiz-start', { submission, quiz, candidate });
}

exports.takeQuiz = async (req, res, next) => {
    const token = req.params.token;
    var submission = await CandidateSubmission.findOne({ where: { token } })

    if (!submission) {
        // todo: return 404
    }

    if (submission.isFinished == 1) {
        res.redirect("/submission/end/" + token);
        return;
    }

    var quiz = await Quiz.findOne({ where: { id: submission.quizId } });
    if (submission.timeLimitMinutes && moment(submission.dateStarted).add(quiz.timeLimitMinutes, 'm') < moment()) {
        res.redirect("/submission/end/" + token);
        return;
    }

    var candidate = await Candidate.findOne({ where: { id: submission.candidateId } });
    var dbQuestions = await Question.findAll({ where: { quizId: submission.quizId } });
    var questions = [];

    for (let index = 0; index < dbQuestions.length; index++) {
        const question = dbQuestions[index];
        var questionService = QuestionServiceFactory.make(question.questionType, question);
        var temp = questionService.getQuestionResponseForSubmission(submission.results);
        questions.push(temp);
    }

    if ((!submission.dateStarted || submission.dateStarted == null) || submission.isStarted == 0) {
        submission.isStarted = 1;
        submission.dateStarted = moment();
        await submission.save({ fields: ['dateStarted', 'isStarted'] });
    }

    res.render('submission/quiz-take', { submission, candidate, quiz, questions, token });
}

exports.saveResults = async (req, res, next) => {
    const answers = req.body.answers;
    const finish = req.body.finish;
    const token = req.params.token;

    var submission = await CandidateSubmission.findOne({ where: { token } })
    var candidate = await Candidate.findOne({ where: { id: submission.candidateId } });
    var quiz = await Quiz.findOne({ where: { id: submission.quizId } });
    var dbQuestions = await Question.findAll({ where: { quizId: submission.quizId } });

    if (!submission || submission.isFinished) {
        res.json({ 'success': false, 'message': 'Invalid submission.' });
        return;
    }

    if (submission.timeLimitMinutes != null && submission.dateStarted != null
        && moment(submission.dateStarted).add(quiz.timeLimitMinutes + 1, 'm') < moment()) {
        res.json({ 'success': false, 'message': 'No time left.' });
        return;
    }

    var fieldsToUpdate = ['results'];
    if (finish) {
        submission.dateFinished = moment();
        submission.isFinished = 1;
        fieldsToUpdate.push('dateFinished', 'isFinished');
    }
    console.log(answers);
    submission.results = answers;
    await submission.save({ fields: fieldsToUpdate});

    res.json({ 'success': true, 'finish': finish, message: 'Results saved successfully' });
}

exports.end = async (req, res, next) => {
    const token = req.params.token;
    var submission = await CandidateSubmission.findOne({ where: { token } })

    if (submission && submission.isFinished) {
        res.render('submission/quiz-ended');
    } else {
        res.render('404');
    }
}
