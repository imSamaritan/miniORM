import mysql from 'mysql2/promise'
import debug from 'debug'
import Execute from './execute/execute.js'

const queryDebugger = debug('miniORM:query')

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
  constructor(
    options = {},
    state = { query: [], values: [] },
    isOperator = false,
    executeMethod = 'all',
  ) {
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
  clone(
    state,
    isOperator = this.#isOperator,
    executeMethod = this.#executeMethod,
  ) {
    const instance = new this.constructor(
      this.#options,
      state,
      isOperator,
      executeMethod,
    )
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
      throw new Error(
        `SQL query can not end with a logical operator [${queryLastPart}]`,
      )
    }

    queryDebugger(this.#state)

    return await this.#execute[method](sql, values)
  }
}

// Export Builder module for named import
import Builder from './builder/Builder.js'

// Export miniORM as default and Builder as named export
export default miniORM
export { Builder }
