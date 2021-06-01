'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Question extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Question.belongsTo(models.Quiz, {
        foreignKey: 'quizId'
      });
    }
  };
  Question.init({
    quizId:
    {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    questionType: {type: DataTypes.STRING, allowNull: false},
    questionText: DataTypes.TEXT,
    points: DataTypes.DECIMAL,
    useQuestionPoints: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: true
    },
    answersData: DataTypes.JSON,
    questionData: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Question',
  });
  return Question;
};