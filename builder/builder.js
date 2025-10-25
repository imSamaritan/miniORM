function selectAll() {
  this.setExecuteMethod('all')
  this.setState({
    query: [`SELECT * FROM ${this.getTable()}`],
  })
  return this
}

function where(condition) {
  const query = this.getState().query
  const values = this.getState().values

  const key = Object.keys(condition)[0]
  const value = condition[key]

  if ('method' in this.getState()) {
    this.setState({ query: [...query, `${key} = ?`], values: [...values, value]})
  } else {
    this.setState({ query: [...query, `WHERE ${key} = ?`], values: [value] })
  }

  return this
}

function or() {
  const query = this.getState().query

  this.setState({
    method: 'or',
    query: [...query, 'OR'],
    values: [...this.getState().values],
  })
  return this
}

function and() {
  const query = this.getState().query

  this.setState({
    method: 'and',
    query: [...query, 'AND'],
    values: [...this.getState().values],
  })
  return this
}

module.exports = { selectAll, where, or, and }
