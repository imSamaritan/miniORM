# miniORM Query Builder API Planning

## Overview

This document outlines the planned API design for splitting the current query functionality into multiple reusable methods. The goal is to create a fluent, chainable query builder interface that provides comprehensive WHERE clause functionality.

## API Method Specifications

### 1. Basic Where Clause Methods

#### `.where(column, operator, value)`
- **Purpose**: Handle basic comparison operators
- **Supported Operators**: `=`, `!=`, `<>`, `>`, `>=`, `<`, `<=`, `LIKE`, `NOT LIKE`
- **Example**: `.where('age', '>=', 18)`
- **SQL Output**: `WHERE age >= 18`

#### `.where(column, operator, {type, value})`
- **Purpose**: Handle typed values with automatic casting
- **Type Options**: `string`, `number`, `boolean`, `date`
- **Example**: `.where('created_at', '>', {type: 'date', value: '2023-01-01'})`
- **SQL Output**: `WHERE created_at > '2023-01-01 00:00:00'`

### 2. Logical Operator Methods

#### `.orWhere(column, operator, value)`
- **Purpose**: Add OR conditions to the query
- **Example**: `.where('status', '=', 'active').orWhere('priority', '=', 'high')`
- **SQL Output**: `WHERE status = 'active' OR priority = 'high'`

#### `.andWhere(column, operator, value)`
- **Purpose**: Explicitly add AND conditions (default behavior)
- **Example**: `.where('status', '=', 'active').andWhere('verified', '=', true)`
- **SQL Output**: `WHERE status = 'active' AND verified = true`

### 3. Array-Based Conditions

#### `.whereIn(column, array_values)`
- **Purpose**: Match column against multiple values using IN operator
- **Example**: `.whereIn('category', ['electronics', 'books', 'clothing'])`
- **SQL Output**: `WHERE category IN ('electronics', 'books', 'clothing')`

#### `.whereNotIn(column, array_values)`
- **Purpose**: Filter out records matching any value in the array
- **Example**: `.whereNotIn('status', ['deleted', 'banned'])`
- **SQL Output**: `WHERE status NOT IN ('deleted', 'banned')`

### 4. Range-Based Conditions

#### `.whereBetween(column, start, end)`
- **Purpose**: Match column values within a range (inclusive)
- **Example**: `.whereBetween('price', 10, 100)`
- **SQL Output**: `WHERE price BETWEEN 10 AND 100`

#### `.whereNotBetween(column, start, end)`
- **Purpose**: Match column values outside a range
- **Example**: `.whereNotBetween('age', 13, 17)`
- **SQL Output**: `WHERE age NOT BETWEEN 13 AND 17`

### 5. NULL Checks

#### `.whereIsNull(column)`
- **Purpose**: Check for NULL values
- **Example**: `.whereIsNull('deleted_at')`
- **SQL Output**: `WHERE deleted_at IS NULL`

#### `.whereIsNotNull(column)`
- **Purpose**: Check for non-NULL values
- **Example**: `.whereIsNotNull('email')`
- **SQL Output**: `WHERE email IS NOT NULL`

### 6. Grouped Conditions

#### `.andGroup(callback)`
- **Purpose**: Group conditions with AND logic
- **Example**: 
  ```javascript
  .andGroup((query) => {
    query.where('status', '=', 'active')
         .orWhere('priority', '=', 'urgent');
  })
  ```
- **SQL Output**: `WHERE (status = 'active' OR priority = 'urgent')`

#### `.orGroup(callback)`
- **Purpose**: Group conditions with OR logic
- **Example**:
  ```javascript
  .orGroup((query) => {
    query.where('role', '=', 'admin')
         .and()
         .where('permissions', 'LIKE', '%write%');
  })
  ```
- **SQL Output**: `WHERE (role = 'admin' AND permissions LIKE '%write%')`

## Implementation Tasks

### Phase 1: Core Infrastructure
- [ ] **Task 1.1**: Create base QueryBuilder class
- [ ] **Task 1.2**: Implement method chaining mechanism
- [ ] **Task 1.3**: Set up SQL clause building infrastructure
- [ ] **Task 1.4**: Create parameter binding system for security

### Phase 2: Basic Where Methods
- [ ] **Task 2.1**: Implement `.where(column, operator, value)` method
- [ ] **Task 2.2**: Implement `.where(column, operator, {type, value})` with type casting
- [ ] **Task 2.3**: Add operator validation and sanitization
- [ ] **Task 2.4**: Create unit tests for basic where functionality

### Phase 3: Logical Operators
- [ ] **Task 3.1**: Implement `.orWhere(column, operator, value)` method
- [ ] **Task 3.2**: Implement `.andWhere(column, operator, value)` method
- [ ] **Task 3.3**: Handle proper AND/OR precedence in SQL generation
- [ ] **Task 3.4**: Create unit tests for logical operators

### Phase 4: Array-Based Conditions
- [ ] **Task 4.1**: Implement `.whereIn(column, array_values)` method
- [ ] **Task 4.2**: Implement `.whereNotIn(column, array_values)` method
- [ ] **Task 4.3**: Add array validation and sanitization
- [ ] **Task 4.4**: Handle empty array edge cases

### Phase 5: Range and NULL Conditions
- [ ] **Task 5.1**: Implement `.whereBetween(column, start, end)` method
- [ ] **Task 5.2**: Implement `.whereNotBetween(column, start, end)` method
- [ ] **Task 5.3**: Implement `.whereIsNull(column)` method
- [ ] **Task 5.4**: Implement `.whereIsNotNull(column)` method
- [ ] **Task 5.5**: Add range validation (start <= end)

### Phase 6: Grouped Conditions
- [ ] **Task 6.1**: Implement `.andGroup(callback)` method
- [ ] **Task 6.2**: Implement `.orGroup(callback)` method
- [ ] **Task 6.3**: Create nested query builder for callbacks
- [ ] **Task 6.4**: Handle proper parentheses generation in SQL
- [ ] **Task 6.5**: Support nested groups (groups within groups)

### Phase 7: Integration and Testing
- [ ] **Task 7.1**: Integrate with existing miniORM structure
- [ ] **Task 7.2**: Create comprehensive test suite
- [ ] **Task 7.3**: Add performance benchmarks
- [ ] **Task 7.4**: Write documentation and usage examples
- [ ] **Task 7.5**: Update existing code to use new API

### Phase 8: Advanced Features
- [ ] **Task 8.1**: Add support for subqueries in where conditions
- [ ] **Task 8.2**: Implement raw SQL expressions with `.whereRaw()`
- [ ] **Task 8.3**: Add column-to-column comparison support
- [ ] **Task 8.4**: Implement case-insensitive string operations

## Usage Examples

### Simple Conditions
```javascript
const users = miniORM.table('users')
  .where('age', '>=', 18)
  .where('status', '=', 'active')
  .done();
```

### Complex Grouped Conditions
```javascript
const products = miniORM.table('products')
  .where('category', '=', 'electronics')
  .andGroup(query => {
    query.whereBetween('price', 100, 500)
         .orWhere('on_sale', '=', true);
  })
  .whereNotIn('brand', ['discontinued-brand-1', 'discontinued-brand-2'])
  .done();
```

### Typed Values
```javascript
const orders = miniORM.table('orders')
  .where('created_at', '>', {type: 'date', value: '2023-01-01'})
  .where('total', '>=', {type: 'number', value: '99.99'})
  .done();
```

## Technical Considerations

### Security
- All user input must be parameterized to prevent SQL injection
- Operator whitelist to prevent malicious operators
- Column name validation to prevent injection through column names

### Performance
- Lazy SQL generation (build query only when executed)
- Query plan caching for repeated similar queries
- Efficient parameter binding

### Compatibility
- Support for multiple database engines (MySQL, PostgreSQL, SQLite)
- Consistent behavior across different SQL dialects
- Graceful fallback for unsupported features

## Success Criteria

1. **Functionality**: All methods work as specified with proper SQL generation
2. **Security**: No SQL injection vulnerabilities
3. **Performance**: Query building overhead < 1ms for typical queries
4. **Usability**: Intuitive API with good error messages
5. **Reliability**: Comprehensive test coverage (>95%)
6. **Maintainability**: Clean, documented code structure

---

**Document Version**: 1.0  
**Last Updated**: Planning Phase  
**Status**: Ready for Implementation