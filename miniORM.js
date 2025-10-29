const mysql = require('mysql2/promise')
const queryDebugger = require('debug')('miniORM:query')
const builder = require('./builder/builder')
const Execute = require('./execute/execute')

class miniORM {
  #options
  #state
  #isOperator
  #executeMethod
  #execute
  #table

  /**
   * @param {{query: string[], values: (number|string)[]}} state
   * @param {boolean} isOperator
   * @param {string} executeMethod
   */
  constructor(options = {}, state = { query: [], values: [] }, isOperator, executeMethod = 'all') {
    this.#options = options
    this.#state = state
    this.#isOperator = isOperator
    this.#executeMethod = executeMethod

    if (options) this.#execute = new Execute(options)
    else this.#execute = new Execute()
  }

  /**
   * @param {{query: string[], values: (number|string)[]}} state
   * @param {boolean} isOperator
   * @param {string} executeMethod
   *
   * @return {miniORM}
   */
  clone(state, isOperator, executeMethod) {
    const instance = new miniORM(this.#options, state, isOperator, executeMethod)
    instance.setTable(this.#table)
    instance.#execute = this.#execute
    return instance
  }

  /**
   * @param {string} table
   * @return {void}
   */
  setTable(table) {
    this.#table = table
  }

  /*** @return {string}*/
  get table() {
    return this.#table
  }

  /*** @return {{query: string[], values: (number|string)[]}}*/
  get state() {
    return this.#state
  }

  get operatorSignal() {
    return this.#isOperator
  }

  /**@return {Promise<mysql.QueryResult>} */
  async done() {
    const { query, values } = this.#state
    const method = this.#executeMethod
    const sql = query.join(' ') + ';'
    const queryLastPart = query[query.length - 1]

    if (queryLastPart === 'AND' || queryLastPart === 'OR') {
      throw new Error(`SQL query can not end with a logical operator [${queryLastPart}]`)
    }

    queryDebugger(this.#state)
    
    return await this.#execute[method](sql, values)
  }
}

Object.assign(miniORM.prototype, builder)

module.exports = miniORM
