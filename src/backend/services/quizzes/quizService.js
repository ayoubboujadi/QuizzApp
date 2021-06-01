
class QuestionService {
    constructor(quizData) {
        this.data = quizData;
    }

    validateQuestion() {

    }

    getQuestionPoints() {

    }

    getQuestionResponse() {

    }

    isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }
}

class SingleAnswerQuestionService extends QuestionService {
    constructor(quizData) {
        super(quizData)
    }

    validateQuestion() {
        var messages = [];

        // At least one answer is present
        if (!this.data.answersData && this.data.answersData.length <= 0) {
            messages.push('Please add some answers!');
        }

        // At least one answer should be marked as correct
        if (!this.data.answersData.some(x => x.isCorrect)) {
            messages.push('Please select at least one answer as the correct one!');
        }

        // Should have a valid points decimal value if useQuestionPoints is true
        if (this.data.useQuestionPoints && !this.isNumeric(this.data.points)) {
            messages.push('Please provide a valid points value for the answer!');
        }

        // The correct answer should have a valid points decimal value if useQuestionPoints is false
        if (!this.data.useQuestionPoints) {
            var correctAnswer = this.data.answers.find(x => x.isCorrect);
            if (!this.isNumeric(correctAnswer?.points))
                messages.push('Please provide a valid points value for the correct answer!');
        }

        return messages;
    }

    getQuestionPoints() {
        if (this.data.useQuestionPoints)
            return this.data.points;
        else {
            var answers = JSON.parse(this.data.answersData);
            var points = 0;
            for (var i = 0; i < answers.length; i++) {
                if (answers[i].points > 0) {
                    points += answers[i].points;
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
            'type': dbQuestion.questionType,
            'text': dbQuestion.questionText,
            'points': dbQuestion.points,
            'useQuestionPoints': dbQuestion.useQuestionPoints,
            'correctAnswer': null,
            'answers': JSON.parse(dbQuestion.answersData)
        };

        if (!question.answers) {
            question.answers = [];
        }

        var correctAnswer = question.answers.find(x => x.isCorrect);
        question.correctAnswer = correctAnswer.valueId;

        return question;
    }
}

class MultiAnswerQuestionService extends QuestionService {
    constructor(quizData) {
        super(quizData)
    }

    validateQuestion() {

    }

    getQuestionPoints() {

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
                    console.log('Unknown QuestionService type...');
                }
        }
    }
}


module.exports = QuestionService;
module.exports = SingleAnswerQuestionService;
module.exports = MultiAnswerQuestionService;
module.exports = new QuestionServiceFactory();