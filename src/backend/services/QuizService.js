// services/PostService.js

const MongooseService = require( "./MongooseService" ); // Data Access Layer
const PostModel = require( "../models/post" ); // Database Model

class QuizService {
  /**
   * @description Create an instance of QuizService
   */
  constructor () {
    // Create instance of Data Access layer using our desired model
    this.MongooseServiceInstance = new MongooseService( PostModel );
  }

  /**
   * @description Attempt to create a post with the provided object
   * @param postToCreate {object} Object containing all required fields to
   * create post
   * @returns {Promise<{success: boolean, error: *}|{success: boolean, body: *}>}
   */
  async create ( postToCreate ) {
    try {
      const result = await this.MongooseServiceInstance.create( postToCreate );
      return { success: true, body: result };
    } catch ( err ) {
      return { success: false, error: err };
    }
  }
}

module.exports = QuizService;