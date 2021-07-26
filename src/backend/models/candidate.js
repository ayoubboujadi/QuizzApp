'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Candidate extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Candidate.belongsTo(models.User, {
        foreignKey: 'userId'
      });

      Candidate.hasMany(models.CandidateSubmission, {
        foreignKey: 'candidateId'
      });
    }
  };
  Candidate.init({
    fullName: DataTypes.STRING,
    email: DataTypes.STRING,
    identification: DataTypes.TEXT,
    userId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Candidate',
  });
  return Candidate;
};