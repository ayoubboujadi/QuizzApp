'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CandidateSubmission extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      CandidateSubmission.belongsTo(models.Candidate, {
        foreignKey: 'candidateId'
      });
      CandidateSubmission.belongsTo(models.Quiz, {
        foreignKey: 'quizId'
      });
    }
  };
  CandidateSubmission.init({
    candidateId: DataTypes.INTEGER,
    quizId: DataTypes.INTEGER,
    token: DataTypes.STRING,
    dateStarted: DataTypes.DATE,
    dateFinished: DataTypes.DATE,
    isStarted: DataTypes.BOOLEAN,
    isFinished: DataTypes.BOOLEAN,
    results: DataTypes.JSON 
  }, {
    sequelize,
    modelName: 'CandidateSubmission',
  });
  return CandidateSubmission;
};