import miniORM from '../miniORM.js'

class Builder extends miniORM {
  /**
   * @param {mysql.PoolOptions} options
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
    super(options, state, isOperator, executeMethod)
  }

  /**
   * @param {string[]} columns
   * @return {Builder}
   * */
  select(...columns) {
    // Check if there's a column at least
    console.log(columns)
    if (columns.length < 1) throw new Error('Column or columns, required!')

    // Check if there are empty columns or not
    if (
      columns.includes('') ||
      columns.includes(null) ||
      columns.includes(undefined)
    )
      throw new Error(
        "List of columns can't include [empty, null or undefined] column(s) name(s)!",
      )

    return this.clone(
      {
        query: [`SELECT ${columns.join(', ')} FROM ${this.table}`],
        values: [],
      },
      false,
      'all',
    )
  }

  /**
   * @return {Builder}
   */
  selectAll() {
    if (arguments.length > 0)
      throw new Error('selectAll method takes none or 0 arguments!')
    return this.select('*')
  }

  /**
   * @param {{[key: string]: number|string}} condition
   * @return {Builder}
   * */
  where(condition) {
    let state = { query: [], values: [] }
    const { query, values } = this.state

    const key = Object.keys(condition)[0]
    const value = condition[key]

    if (this.operatorSignal) {
      state = { query: [...query, `${key} = ?`], values: [...values, value] }
    } else {
      state = { query: [...query, `WHERE ${key} = ?`], values: [value] }
    }

    return this.clone(state)
  }

  /**
   * @return {Builder}
   */
  or() {
    const { query, values } = this.state
    return this.clone({ query: [...query, 'OR'], values: [...values] }, true)
  }

  /**
   * @return {Builder}
   */
  and() {
    const { query, values } = this.state
    return this.clone({ query: [...query, 'AND'], values: [...values] }, true)
  }
}

export default Builder
