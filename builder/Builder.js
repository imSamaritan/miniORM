class Builder {
  /** @param {string[]} columns @return {Builder} */
  select(...columns) {
    if (columns.length < 1) throw new Error('Column or columns, required!')

    if ( columns.includes('') || columns.includes(null) || columns.includes(undefined))
      throw new Error("List of columns can't include [empty, null or undefined] column(s) name(s)!" )

    return this.clone({query: [`SELECT ${columns.join(', ')} FROM ${this.table}`], values: []}, false, 'all')
  }

  /** @return {Builder}*/
  selectAll() {
    if (arguments.length > 0)
      throw new Error('selectAll method takes none or 0 arguments!')
    return this.select('*')
  }

  /** @return {Builder}*/
  or() {
    const { query, values } = this.state
    return this.clone({ query: [...query, 'OR'], values: [...values] }, true)
  }

  /** @return {Builder}*/
  and() {
    const { query, values } = this.state
    return this.clone({ query: [...query, 'AND'], values: [...values] }, true)
  }
}

export default Builder
