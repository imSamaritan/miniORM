const miniORM = require('./miniORM')

/**@return {miniORM} */
function selectAll() {
  return this.clone({ query: [`SELECT * FROM ${this.table}`], values: [] }, false, 'all')
}

/**
 * @param {{column: number|string}} condition
 * @return {miniORM} 
 * */
function where(condition) {
  let state = {query: [], values: []}
  const query = this.state.query
  const values = this.state.values

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
  const query = this.state.query
  const values = this.state.values

  return this.clone({query: [...query, 'OR'], values: [...values], },true)
}

/**@return {miniORM} */
function and() {
  const query = this.state.query
  const values = this.state.values

  return this.clone({ query: [...query, 'AND'], values: [...values]}, true)
}

module.exports = { selectAll, where, or, and }
