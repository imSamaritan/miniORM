const miniORM = require('../miniORM')

/**@return {miniORM} */
function selectAll() {
  return this.clone({ query: [`SELECT * FROM ${this.table}`], values: [] })
}

/**
 * @param {string[]} columns
 * @return {miniORM}
 * */
function select(...columns) {
  //Check if there's a column atleast
  if (columns.length < 1) {
    throw new Error('Column or columns, required!')
  }

  //Check if there are empty columns or not
  if (columns.includes('')) {
    throw new Error("List of columns can't includes empty column names!")
  }

  return this.clone(
    {
      query: [`SELECT ${columns.join(', ')} FROM ${this.table}`],
      values: [],
    },
    false,
    'all'
  )
}

/**
 * @param {{column: number|string}} condition
 * @return {miniORM}
 * */
function where(condition) {
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

/**@return {miniORM} */
function or() {
  const { query, values } = this.state
  return this.clone({ query: [...query, 'OR'], values: [...values] }, true)
}

/**@return {miniORM} */
function and() {
  const { query, values } = this.state
  return this.clone({ query: [...query, 'AND'], values: [...values] }, true)
}

module.exports = { selectAll, select, where, or, and }
