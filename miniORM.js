const { PoolOptions, QueryResult } = require('mysql2/promise')
const Execute = require('./execute/execute')

class miniORM {
  /**
   * @property {Execute} #execute
   */
  #execute
  /**
   * @param {PoolOptions} options
   */
  constructor(options) {
    if (options) {
      this.#execute = new Execute(options)
    } else {
      this.#execute = new Execute()
    }
  }

  /**
   * @returns {Promise<QueryResult>}
   */
  async done() {
    return await this.#execute.all()
  }
}

module.exports = miniORM
