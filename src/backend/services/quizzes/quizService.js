
class QuestionService {
    constructor(quizData) {
        this.data = quizData;
    }

    validateQuestion() { }

    getQuestionPoints() { }

    getQuestionResponse() { }

    getQuestionResponseForSubmission() { }

    gradeQuestion() { }

    isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    arraysEqual(a, b) {
        if (a === b) return true;
        if (a == null || b == null) return false;
        if (a.length !== b.length) return false;

        a.sort();
        b.sort();

        for (var i = 0; i < a.length; ++i) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    }
}

class SingleAnswerQuestionService extends QuestionService {
    constructor(quizData) {
        super(quizData)
    }

    validateQuestion() {
        var messages = [];

        // At least one answer is present
        if (!this.data.answersData && this.data.answers?.length <= 0) {
            messages.push('Please add some answers!');
        }

        // At least one answer should be marked as correct
        if (!this.data.answers?.some(x => x.isCorrect)) {
            messages.push('Please select at least one option as the correct answer!');
        }

        // Should have a valid points decimal value if useQuestionPoints is true
        if (this.data.useQuestionPoints && !this.isNumeric(this.data.points)) {
            messages.push('Please provide a valid points value for the answer!');
        }

        // The correct answer should have a valid points decimal value if useQuestionPoints is false
        if (!this.data.useQuestionPoints) {
            var correctAnswer = this.data.answers?.find(x => x.isCorrect);
            if (!this.isNumeric(correctAnswer?.points))
                messages.push('Please provide a valid points value for the correct answer!');
        }

        if (messages.length == 0)
            return null;

        return { 'id': this.data.id, 'messages': messages };
    }

    getQuestionPoints() {
        if (this.data.useQuestionPoints && this.data.points){
            return this.data.points;
        }
        else {
            var answers = this.data.answersData;
            var points = 0;
            for (var i = 0; i < answers.length; i++) {
                if (answers[i].isCorrect && answers[i].points && parseFloat(answers[i].points) > 0) {
                    points += parseFloat(answers[i].points);
                }
            }
            return points;
        }
    }

    getQuestionResponse() {
        var dbQuestion = this.data;
        var question = {
            'id': dbQuestion.id,
            'isNew': false,
            'isEditing': false,
            'questionType': dbQuestion.questionType,
            'text': dbQuestion.questionText,
            'points': dbQuestion.points,
            'useQuestionPoints': dbQuestion.useQuestionPoints == 1,
            'correctAnswer': null,
            'answers': dbQuestion.answersData
        };

        if (!question.answers) {
            question.answers = [];
        }

        var correctAnswer = question.answers.find(x => x.isCorrect);
        question.correctAnswer = correctAnswer?.valueId;

        return question;
    }

    getQuestionResponseForSubmission(oldAnswers) {
        var dbQuestion = this.data;
        var answersData = dbQuestion.answersData;
        answersData.forEach(element => {
            element.points = undefined;
            element.isCorrect = undefined;
        });

        var question = {
            'id': dbQuestion.id,
            'questionType': dbQuestion.questionType,
            'text': dbQuestion.questionText,
            'points': this.getQuestionPoints(),
            'answers': answersData,
            'result': null
        };

        var oldQuestionAnswer = oldAnswers?.find(x => x.questionId == question.id);
        if (oldQuestionAnswer) {
            question.result = oldQuestionAnswer.answer;
        }

        return question;
    }

    gradeQuestion(candidateAnswers) {
        const questionAnswersData = this.data.answersData;

        var questionAnswer = candidateAnswers.find(x => x.questionId == this.data.id);
        if (questionAnswer) {
            var relatedAnswer = questionAnswersData.find(x => x.valueId == questionAnswer.answer);
            var points = 0;
            if(relatedAnswer.points && parseFloat(relatedAnswer.points) != NaN){
                points = parseFloat(relatedAnswer.points);
            }

            if(relatedAnswer.isCorrect){
                return { isCorrect: true, points}
            }
            else{
                return { isCorrect: false, points: points * -1 }
            }
        }

        return { isCorrect: false, points: 0 };
    }
}

class MultiAnswerQuestionService extends QuestionService {
    constructor(quizData) {
        super(quizData)
    }

    validateQuestion() {
        var messages = [];

        // At least one answer is present
        if (!this.data.answersData && this.data.answers?.length <= 0) {
            messages.push('Please add some answers!');
        }

        // At least one answer should be marked as correct
        if (!this.data.answers?.some(x => x.isCorrect)) {
            messages.push('Please select at least one option as the correct answer!');
        }

        // Should have a valid points decimal value if useQuestionPoints is true
        if (!this.isNumeric(this.data.points)) {
            messages.push('Please provide a valid points value for the answer!');
        }

        if (messages.length == 0)
            return null;

        return { 'id': this.data.id, 'messages': messages };
    }

    getQuestionPoints() {
        return parseFloat(this.data.points);
    }

    getQuestionResponse() {
        var dbQuestion = this.data;
        var question = {
            'id': dbQuestion.id,
            'isNew': false,
            'isEditing': false,
            'questionType': dbQuestion.questionType,
            'text': dbQuestion.questionText,
            'points': dbQuestion.points,
            'useQuestionPoints': dbQuestion.useQuestionPoints == 1,
            'answers': dbQuestion.answersData
        };

        if (!question.answers) {
            question.answers = [];
        }

        return question;
    }

    getQuestionResponseForSubmission(oldAnswers) {
        var dbQuestion = this.data;
        var answersData = dbQuestion.answersData;
        answersData.forEach(element => {
            element.points = undefined;
            element.isCorrect = undefined;
            element.isChecked = false;
        });

        var question = {
            'id': dbQuestion.id,
            'questionType': dbQuestion.questionType,
            'text': dbQuestion.questionText,
            'points': this.getQuestionPoints(),
            'answers': answersData,
            'result': []
        };

        var oldQuestionAnswer = oldAnswers?.find(x => x.questionId == question.id);
        if (oldQuestionAnswer) {
            question.result = oldQuestionAnswer.answer;
        }

        return question;
    }

    gradeQuestion(candidateAnswers) {
        const questionAnswersData = this.data.answersData;

        var questionAnswer = candidateAnswers?.find(x => x.questionId == this.data.id);
        if (questionAnswer) {
            if (this.arraysEqual(questionAnswer.answer, questionAnswersData.filter(x => x.isCorrect).map(x => x.valueId))) {
                return { isCorrect: true, points: this.getQuestionPoints() }
            }
        }

        return { isCorrect: false, points: 0 };
    }
}

class QuestionServiceFactory {
    make(type, quizData) {
        switch (type) {
            case 'single-choice':
                return new SingleAnswerQuestionService(quizData);

            case 'multi-choice':
                return new MultiAnswerQuestionService(quizData);

            default:
                {
                    console.log('Unknown QuestionService type:', type);
                }
        }
    }
}


module.exports = QuestionService;
module.exports = SingleAnswerQuestionService;
module.exports = MultiAnswerQuestionService;
module.exports = new QuestionServiceFactory();