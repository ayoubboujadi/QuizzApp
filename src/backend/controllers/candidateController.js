const { Candidate, Quiz, CandidateSubmission, Question } = require('../models');
var QuestionServiceFactory = require('../services/quizzes/quizService')
var moment = require('moment');

exports.createCandidatePage = (req, res, next) => {
    res.render('candidate/candidate-create');
}

exports.createCandidate = async (req, res, next) => {
    const { fullName, email, identification } = req.body;

    const currentUserId = req.user.id;

    var candidate = {
        fullName, email, identification, userId: currentUserId
    };

    var createdCandidate = await Candidate.create(candidate);

    res.redirect("/candidate/list/");
}

exports.listCandidates = async (req, res, next) => {
    const currentUserId = req.user.id;
    var candidates = await Candidate.findAll({ where: { userId: currentUserId }, include: CandidateSubmission });
    var quizzes = await Quiz.findAll({ where: { userId: currentUserId } });
    res.render('candidate/candidate-list', { candidates, quizzes });
}

exports.candidateSubmissions = async (req, res, next) => {
    const currentUserId = req.user.id;
    const candidateId = req.params.candidateId

    var candidate = await Candidate.findOne({ where: { id: candidateId, userId: currentUserId } });

    if (!candidate) {
        // TODO: Add a 404 page redirect here
    }

    var candidateSubmissions = await CandidateSubmission.findAll({ where: { candidateId: candidateId }, include: [Quiz] });

    var hostname = req.header('host');
    res.render('candidate/candidate-submissions', { candidateSubmissions, candidate, hostname, moment });
}

exports.assignCandidate = async (req, res, next) => {
    const currentUserId = req.user.id;
    const quizzesIds = req.body.quizzesIds;
    const candidateId = req.body.candidateId;

    var quizzes = await Quiz.findAll({ where: { id: quizzesIds, userId: currentUserId }, raw: true });

    if (!quizzes.length) {
        res.json({ 'success': false, 'message': 'None of the requested Quizzes exist.' });
        return;
    }

    var candidate = await Candidate.findOne({ where: { id: candidateId, userId: currentUserId }, raw: true });
    if (!candidate) {
        res.json({ 'success': false, 'message': 'Candidate does not exist.' });
        return;
    }

    for (let index = 0; index < quizzes.length; index++) {
        const quiz = quizzes[index];
        var candidateSubmission = await CandidateSubmission.findOne({ where: { quizId: quiz.id, candidateId: candidateId }, raw: true });

        if (candidateSubmission) {
            continue;
        }

        candidateSubmission = {
            candidateId,
            quizId: quiz.id,
            token: generateToken(10),
            isStarted: 0,
            isFinished: 0
        };

        var createdCandidate = await CandidateSubmission.create(candidateSubmission);
    }

    var candidateAssignedQuizzes = await CandidateSubmission.findAll({ where: { candidateiD: candidateId } });

    res.json({ 'success': true, 'candidateSubmissions': candidateAssignedQuizzes });
}

exports.deleteCandidateSubmission = async (req, res, next) => {
    const currentUserId = req.user.id;
    const submissionId = req.params.submissionId;

    var candidateSubmission = await CandidateSubmission.findOne({
        where: { id: submissionId },
        raw: true,
        include: [{ model: Quiz, attributes: ['userId'] }, { model: Candidate, attributes: ['userId'] }]
    });

    if (!candidateSubmission || candidateSubmission['Quiz.userId'] != currentUserId || candidateSubmission['Candidate.userId'] != currentUserId) {
        res.json({ 'success': false, 'message': 'Candidate Submission does not exist.' });
        return;
    }

    await CandidateSubmission.destroy({ where: { id: candidateSubmission.id } });

    var candidateAssignedQuizzes = await CandidateSubmission.findAll({ where: { candidateiD: candidateSubmission.candidateId } });

    res.json({ 'success': true, 'candidateSubmissions': candidateAssignedQuizzes });
}

exports.candidateResult = async (req, res, next) => {
    const currentUserId = req.user.id;
    const submissionId = req.params.submissionId;
    const quizId = req.params.quizId;

    var candidateSubmission = await CandidateSubmission.findOne({ where: { id: submissionId } });

    if (!candidateSubmission) {
        res.render('404');
        return;
    }

    var quiz = await Quiz.findOne({ where: { id: candidateSubmission.quizId, userId: currentUserId }, include: Question });

    var overallResult = { totalPoints: 0, gottenPoints: 0 };
    var gradingResults = [];
    for (var i = 0; i < quiz.Questions.length; i++) {
        var question = quiz.Questions[i];
        var questionService = QuestionServiceFactory.make(question.questionType, question);
        var gradingResult = questionService.gradeQuestion(candidateSubmission.results);

        gradingResults.push({
            question: question,
            gradingResult,
            questionPoints: questionService.getQuestionPoints()
        });

        console.log({questionPoints: questionService.getQuestionPoints()})

        overallResult.totalPoints += parseFloat(questionService.getQuestionPoints());
        overallResult.gottenPoints += parseFloat(gradingResult.points);
        console.log({gottenPoints: overallResult.gottenPoints})

        question.answersData = null;
    }

    quiz.Questions = null;
    var candidate = await Candidate.findOne({ where: { id: candidateSubmission.candidateId, userId: currentUserId } });

    res.render('candidate/candidate-result', { candidateSubmission, candidate, quiz, gradingResults, overallResult, moment });
}

function generateToken(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}