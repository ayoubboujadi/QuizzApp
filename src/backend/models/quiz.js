'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Quiz extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Quiz.belongsTo(models.User, {
        foreignKey: 'userId'
      });

      Quiz.hasMany(models.Question, {
        foreignKey: 'quizId'
      });

      Quiz.hasMany(models.CandidateSubmission, {
        foreignKey: 'quizId'
      });
    }
  };
  Quiz.init({
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    userId: DataTypes.INTEGER,
    timeLimitMinutes: DataTypes.INTEGER,
    availableFromDate: DataTypes.DATE,
    availableToDate: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'Quiz',
  });
  return Quiz;
};