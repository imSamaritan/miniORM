import Helper from '../helper/Helper.js'

class Builder {
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

    return this.clone(
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

  /** @param {string} column @param {string} operator @param {any} value @return miniORM*/
  where(column, operator, value) {

    let state = { query: [], values: [] }
    const argumentsCount = arguments.length
    const { query, values } = this.state
    const supportedOperators = ['=','!=','<>','>','>=','<','<=','LIKE','NOT LIKE']
    
    operator = operator.toUpperCase()

    const columnIsNotStringOrEmpty = !(typeof column === 'string') || column.length === 0
    const operatorNotSupportedOrEmpty = !supportedOperators.includes(operator) || operator.length === 0
    const valueIsStringAndNotEmpty = typeof value === 'string' && value !== ''
    const valueIsBoolean = typeof value === 'boolean'
    const valueIsANumber = typeof value === 'number'
    
    const valueIsAnObject = value instanceof Object

    if (argumentsCount < 3) 
      throw new Error('Where method takes 3 arguments!')
    
    if (columnIsNotStringOrEmpty)
      throw new Error('Column should be string type and not be empty')
    
    if (operatorNotSupportedOrEmpty)
      throw new Error(`Supported operators (${supportedOperators.join(',')})`)

    if (valueIsStringAndNotEmpty || valueIsBoolean || valueIsANumber) {
      if (this.operatorSignal)
        state = {
          query: [...query, `${column} ${operator} ?`],
          values: [...values, value],
        }
      else
        state = {
          query: [...query, `WHERE ${column} ${operator} ?`],
          values: [value],
        }
    }

    if (valueIsAnObject) {
      const valueKeys = Object.keys(value)
      const valueIsNullOrUndefined = [null, undefined].includes(value['value'])
      const valueIsAnObject = value['value'] instanceof Object
      const valueIsAnArray = Array.isArray(value['value'])
      const valueIsInvalidOrEmptyString = !value['value'] || value['value'] === ''
      
      const valueKeyIsNotPresent = !valueKeys.includes('value') 
      const typeKeyIsNotPresent = !valueKeys.includes('type') 
      const typeKeyIsNotStringType = typeof value['type'] != 'string'
      const typeKeyIsEmpty = value['type'] === ''
      
      if (valueKeyIsNotPresent)
        throw new Error('Value key is required and must carry a valid value!')

      if (valueIsNullOrUndefined || valueIsAnObject || valueIsAnArray || valueIsInvalidOrEmptyString) 
        throw new Error('Value can not be (null, undefined, {}, []) or empty!')
      
      if (typeKeyIsNotPresent || typeKeyIsNotStringType || typeKeyIsEmpty) 
        throw new Error('Type key is required and must contain a string type as value')
      
      const _type = value['type']
      const _value = Helper.castValue(value['value'], _type)

      if (this.operatorSignal) 
        state = {
          query: [...query, `${column} ${operator} ?`],
          values: [...values, _value],
        }
       else 
        state = {
          query: [...query, `WHERE ${column} ${operator} ?`],
          values: [_value],
        }
      
    }

    return this.clone(state)
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
