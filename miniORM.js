const { PoolOptions } = require('mysql2/promise')
const Execute = require('./execute/execute')

class miniORM {
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

  async done() {
    return await this.#execute.all()
  }
}

module.exports = miniORM
