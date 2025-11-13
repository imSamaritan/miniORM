import Helper, { _cloneMethodSymbol as _clone } from '../helper/Helper.js'

class Builder {
  /**
   * @param {string} column
   * @param {string} operator
   * @param {string|number|boolean|object} value
   * @param {string} logicOperaor
   * @param {string} method
   * @return {Builder}
   */
  #andOr(column, operator, value, logicOperaor, method) {
    const { query, values } = this.state
    const queryLastPart = query[query.length - 1]
    let whereMethodNotUsed = !query.join('').includes('WHERE')

    if (queryLastPart === 'AND' || queryLastPart === 'OR') {
      throw new Error(
        `"${method}" method can not be called after and()/or() method operator!`,
      )
    }

    if (whereMethodNotUsed) {
      throw new Error(
        `"${method}" method must be chained after the "where" method!`,
      )
    }

    const state = { query: [...query, logicOperaor], values: [...values] }
    const orWhereInstance = this[_clone](state, true)

    const builder = orWhereInstance.where(column, operator, value)
    return builder
  }

  /**
   * @param {Closure} callback
   * @param {string} logicOperaor
   * @returns {Builder}
   */
  #group(callback, logicOperaor) {
    const { query, values } = this.state

    const builder = this[_clone]({ query: [...query, logicOperaor], values: [...values]}, true)
    return callback(builder)
  }

  /**@param {string} column @param {Array} list @param {'NOT IN'|'IN'} operator @return {Builder} */
  #inOrNotIn(column, list, operator) {
    let state = { query: [], values: [] }
    const { query, values } = this.state

    if (typeof column != 'string' || column === '')
      throw new Error('Column should be string and not empty!')

    if (!Array.isArray(list) || list.length < 1)
      throw new Error('List should be an array type and not empty!')

    const placeholders = list.map((value) => '?').join(',')

    if (this.operatorSignal)
      state = {
        query: [...query, `${column} ${operator}(${placeholders})`],
        values: [...values, ...list],
      }
    else
      state = {
        query: [...query, `WHERE ${column} ${operator}(${placeholders})`],
        values: [...values, ...list],
      }

    return this[_clone](state, true)
  }

  /** @param {string} column @param {string} operator @returns {Builder} */
  #nullOrNotNull(column, operator) {
    let state = { query: [], values: [] }
    const { query, values } = this.state
    const queryLastPart = query[query.length - 1]

    if (queryLastPart.includes('WHERE'))
      throw new Error(
        `where() and whereIsNull() methods must be chained through and() or or() or use grouping methods!`,
      )

    if (typeof column != 'string' || column === '')
      throw new Error('Column should be a string and not empty!')

    if (this.operatorSignal)
      state = {
        query: [...query, `${column} ${operator}`],
        values: [...values],
      }
    else
      state = {
        query: [...query, `WHERE ${column} ${operator}`],
        values: [...values],
      }

    return this[_clone](state)
  }

  /** @param {string[]} columns @return {Builder} */
  select(...columns) {
    if (columns.length < 1) throw new Error('Column or columns, required!')

    if (
      columns.includes('') ||
      columns.includes(null) ||
      columns.includes(undefined)
    )
      throw new Error(
        "List of columns can't include [empty, null or undefined] column(s) name(s)!",
      )

    return this[_clone](
      {
        query: [`SELECT ${columns.join(', ')} FROM ${this.table}`],
        values: [],
      },
      false,
      'all',
    )
  }

  /** @return {Builder}*/
  selectAll() {
    if (arguments.length > 0)
      throw new Error('selectAll method takes none or 0 arguments!')
    return this.select('*')
  }

  /**
  @param {string} column
  @param {string} operator
  @param {boolean|number|string|object} value
  @return {Builder}*/
  where(column, operator, value) {
    let stateValue
    let state = { query: [], values: [] }
    const argumentsCount = arguments.length
    const { query, values } = this.state
    const supportedOperators = [
      '=',
      '!=',
      '<>',
      '>',
      '>=',
      '<',
      '<=',
      'LIKE',
      'NOT LIKE',
    ]
    const notSupportedOperators = [
      'IS NULL',
      'IS NOT NULL',
      'IN',
      'NOT IN',
      'BETWEEN',
      'NOT BETWEEN',
    ]

    const whereMethodUsed = query[query.length - 1].includes('WHERE')

    if (whereMethodUsed) {
      throw new Error(
        '"Where" method can not be chain after another one, consider using the following methods after where (or(), and(), orWhere(), andWhere(), orGroup(cb), andGroup(cb)',
      )
    }

    operator = operator.toUpperCase()

    const columnIsNotStringOrEmpty =
      !(typeof column === 'string') || column.length === 0
    const operatorNotSupportedOrEmpty =
      !supportedOperators.includes(operator) || operator.length === 0
    const valueIsStringAndNotEmpty = typeof value === 'string' && value !== ''
    const valueIsBoolean = typeof value === 'boolean'
    const valueIsANumber = typeof value === 'number'

    const valueIsAnObject = value instanceof Object

    if (argumentsCount < 3 || argumentsCount > 3)
      throw new Error('Where method takes 3 arguments (column,operator,value)!')

    if (columnIsNotStringOrEmpty)
      throw new Error('Column should be string type and not be empty')

    if (notSupportedOperators.includes(operator))
      throw new Error(
        `For the current used operator ${operator}, consider using corresponding method operator (whereIsNotNull(), whereIsNull(), whereIn(), whereNotIn(), whereBetween() and whereNotBetween()`,
      )

    if (operatorNotSupportedOrEmpty)
      throw new Error(`Supported operators (${supportedOperators.join(',')})`)

    if (valueIsStringAndNotEmpty || valueIsBoolean || valueIsANumber)
      stateValue = value

    if (valueIsAnObject) {
      const valueKeys = Object.keys(value)
      const valueIsNullOrUndefined = [null, undefined].includes(value['value'])
      const valueIsAnObject = value['value'] instanceof Object
      const valueIsAnArray = Array.isArray(value['value'])
      const valueIsInvalidOrEmptyString =
        !value['value'] || value['value'] === ''

      const valueKeyIsNotPresent = !valueKeys.includes('value')
      const typeKeyIsNotPresent = !valueKeys.includes('type')
      const typeKeyIsNotStringType = typeof value['type'] != 'string'
      const typeKeyIsEmpty = value['type'] === ''

      if (valueKeyIsNotPresent)
        throw new Error('Value key is required and must carry a valid value!')

      if (
        valueIsNullOrUndefined ||
        valueIsAnObject ||
        valueIsAnArray ||
        valueIsInvalidOrEmptyString
      )
        throw new Error('Value can not be (null, undefined, {}, []) or empty!')

      if (typeKeyIsNotPresent || typeKeyIsNotStringType || typeKeyIsEmpty)
        throw new Error(
          'Type key is required and must contain a string type as value',
        )

      const _type = value['type']
      stateValue = Helper.castValue(value['value'], _type)
    }

    if (this.operatorSignal)
      state = {
        query: [...query, `${column} ${operator} ?`],
        values: [...values, stateValue],
      }
    else
      state = {
        query: [...query, `WHERE ${column} ${operator} ?`],
        values: [stateValue],
      }

    return this[_clone](state, true)
  }

  /** @return {Builder}*/
  or() {
    const { query, values } = this.state
    return this[_clone]({ query: [...query, 'OR'], values: [...values] }, true)
  }

  /**
  @param {string} column
  @param {string} operator
  @param {boolean|number|string|object} value
  @return {Builder}*/
  orWhere(column, operator, value) {
    return this.#andOr(column, operator, value, 'OR', 'orWhere')
  }

  /**
   * @param {Closure} callback
   * @returns {Builder}
   */
  orGroup(callback) {
    return this.#group(callback, 'OR')
  }

  /** @return {Builder}*/
  and() {
    const { query, values } = this.state
    return this[_clone]({ query: [...query, 'AND'], values: [...values] }, true)
  }

  /**
  @param {string} column
  @param {string} operator
  @param {boolean|number|string|object} value
  @return {Builder}
  */
  andWhere(column, operator, value) {
    return this.#andOr(column, operator, value, 'AND', 'andWhere')
  }

  /**
   * @param {Closure} callback
   * @returns {Builder}
   */
  andGroup(callback) {
    return this.#group(callback, 'AND')
  }

  /**@param {string} column @param {Array} list @returns {Builder} */
  whereIn(column, list) {
    return this.#inOrNotIn(column, list, 'IN')
  }

  /**@param {string} column @param {Array} list @returns {Builder} */
  whereNotIn(column, list) {
    return this.#inOrNotIn(column, list, 'NOT IN')
  }

  /** @param {string} column @returns {Builder} */
  whereIsNull(column) {
    if (arguments.length < 1 || arguments.length > 1)
      throw new Error(
        '"Column name" argument is the only one that is required!',
      )
    return this.#nullOrNotNull(column, 'IS NULL')
  }

  /** @param {string} column @returns {Builder} */
  whereIsNotNull(column) {
    if (arguments.length < 1 || arguments.length > 1)
      throw new Error(
        '"Column name" argument is the only one that is required!',
      )
    return this.#nullOrNotNull(column, 'IS NOT NULL')
  }
}

export default Builder
