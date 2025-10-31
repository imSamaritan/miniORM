import mysql from 'mysql2/promise'
import debug from 'debug'
import Execute from './execute/Execute.js'
import Builder from './builder/Builder.js'

const queryDebugger = debug('miniORM:query')

/**
 * miniORM - A lightweight ORM with auto-closing connection pool
 *
 * Connection pool management is handled automatically:
 * - Pool is created once and reused across all instances
 * - Automatic cleanup occurs when the process exits
 * - Manual closing is not supported - all consumers use auto-closing
 */
class miniORM extends Builder {
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
    super()
    this.#options = options
    this.#state = state
    this.#isOperator = isOperator
    this.#executeMethod = executeMethod

    this.#execute = new Execute(options)
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

// Export miniORM as default
export default miniORM
