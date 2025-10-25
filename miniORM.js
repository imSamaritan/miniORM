const { PoolOptions, QueryResult } = require('mysql2/promise')
const builder = require('./builder/builder')
const Execute = require('./execute/execute')

class miniORM {
  #execute
  #state
  #table
  #executeMethod

  constructor(options) {
    if (options) {
      this.#execute = new Execute(options)
    } else {
      this.#execute = new Execute()
    }
  }

  table(table) {
    this.#table = table
  }

  getTable() {
    return this.#table
  }

  setState(state) {
    this.#state = state
  }

  getState() {
    return this.#state
  }

  setExecuteMethod(method) {
    this.#executeMethod = method
  }

  async done() {
    const method = this.#executeMethod
    const query = this.#state.query
    const values = this.#state.values

    return await this.#execute[method](query.join(' ') + ';', values)
  }
}

Object.assign(miniORM.prototype, builder)

module.exports = miniORM
