# miniORM - Current API Summary

**Last Updated:** 2024
**Purpose:** Document the current API implementation to align README and usage examples

---

## 🔍 API Audit Results

This document provides a complete overview of the miniORM API as currently implemented in the codebase.

---

## Core Architecture

### Class Structure
```
miniORM (extends Builder)
  ├── Execute (database execution)
  └── Builder (query building methods)
```

### Connection Management
- **Singleton Pattern**: Single shared connection pool across all instances
- **Auto-cleanup**: Automatically closes on process exit (SIGINT, SIGTERM, exit)
- **Configuration Sources**: Environment variables or constructor options

---

## 📚 Complete API Reference

### 1. Constructor & Initialization

#### `new miniORM(options?)`
Creates a new miniORM instance with optional database configuration.

```javascript
// Use environment variables (.env file)
const model = new miniORM()

// Override with custom options
const model = new miniORM({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'mydb',
  port: 3306,
  connectionLimit: 10
})
```

**Options:**
- `host`: Database host (default: `process.env.DB_HOST` or `'localhost'`)
- `user`: Database user (default: `process.env.DB_USER` or `'root'`)
- `password`: Database password (default: `process.env.DB_PASSWORD`)
- `database`: Database name (default: `process.env.DB_NAME`)
- `port`: Database port (default: `process.env.DB_PORT` or `3306`)
- `connectionLimit`: Connection pool limit (default: `process.env.CONNECTION_LIMIT` or `10`)

---

### 2. Table Selection Methods

#### `fromTable(tableName)`
Sets the table and returns a new instance. Must be called first in the chain.

```javascript
const users = await model.fromTable('users').selectAll()
const posts = await model.fromTable('posts').select('id', 'title')
```

**Rules:**
- Must be first in the method chain
- Cannot be called after other query methods
- Alternative to `setTable()`

#### `setTable(tableName)`
Internal method to set the table name. Used with persistent model instances.

```javascript
model.setTable('users')
const all = await model.selectAll().done()
const active = await model.select('id', 'name').where('status', '=', 'active').done()
```

---

### 3. Query Execution

#### `done()`
Executes the query and returns results.

```javascript
const results = await model.fromTable('users').selectAll().done()
```

#### Promise-like Behavior (`.then()`)
Queries can be awaited directly without calling `.done()`.

```javascript
// Both are equivalent:
const results = await model.fromTable('users').selectAll().done()
const results = await model.fromTable('users').selectAll()
```

---

### 4. SELECT Operations

#### `select(...columns)`
Selects specific columns from the table.

```javascript
// Single column
const names = await model.fromTable('users').select('name')

// Multiple columns
const userInfo = await model.fromTable('users').select('id', 'name', 'email')
```

**Validation:**
- At least one column required
- No empty, null, or undefined column names allowed

#### `selectAll()`
Selects all columns (equivalent to `SELECT *`).

```javascript
const allUsers = await model.fromTable('users').selectAll()
```

**Rules:**
- Takes no arguments
- Internally calls `select('*')`

#### `countRecords()`
Returns the count of records in the table.

```javascript
const count = await model.fromTable('users').countRecords()
// Returns: [{ recordsCount: 42 }]
```

**Rules:**
- Must be called first in the chain (cannot follow other query methods)
- Takes no arguments

---

### 5. INSERT Operations

#### `insert(details)`
Inserts a new record into the table.

```javascript
const result = await model
  .fromTable('users')
  .insert({
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin'
  })

console.log(result.insertId) // Auto-increment ID
```

**Rules:**
- Must take a non-empty object
- Cannot be chained after other query methods
- Returns object with `insertId` property

---

### 6. UPDATE Operations

#### `update(details)`
Updates records in the table.

```javascript
// Update with WHERE condition
const result = await model
  .fromTable('users')
  .update({
    status: 'inactive',
    updated_at: new Date()
  })
  .where('last_login', '<', '2024-01-01')

// Bulk update with complex conditions
const result = await model
  .fromTable('users')
  .update({ view_count: 0 })
  .where('status', '=', 'archived')
  .andWhere('created_at', '<', '2023-01-01')
```

**Rules:**
- Must take a non-empty object
- Cannot be chained after other query methods
- Should be combined with WHERE clause for safety

---

### 7. DELETE Operations

#### `delete()`
Deletes records from the table.

```javascript
// Delete with WHERE condition
const result = await model
  .fromTable('users')
  .delete()
  .where('status', '=', 'banned')

// Delete all records (use with caution!)
const result = await model.fromTable('temp_data').delete()
```

**Rules:**
- Can be used with or without WHERE clause
- Always use WHERE clause unless intentionally deleting all records

---

### 8. WHERE Clause Methods

#### `where(column, operator, value)`
Primary WHERE clause method. Supports multiple operators and type casting.

```javascript
// Basic usage
await model.fromTable('users').select('*').where('status', '=', 'active')

// With comparison operators
await model.fromTable('products').select('*').where('price', '>', 100)
await model.fromTable('users').select('*').where('age', '>=', 18)

// With LIKE operator
await model.fromTable('users').select('*').where('name', 'LIKE', '%John%')

// With type casting
await model.fromTable('users').select('*').where('age', '>', { value: '18', type: 'number' })
await model.fromTable('users').select('*').where('is_verified', '=', { value: 'true', type: 'boolean' })
```

**Supported Operators:**
- `=` - Equal
- `!=` - Not equal
- `<>` - Not equal (alternative)
- `>` - Greater than
- `>=` - Greater than or equal
- `<` - Less than
- `<=` - Less than or equal
- `LIKE` - Pattern matching
- `NOT LIKE` - Negative pattern matching

**Type Casting:**
Pass value as object with `value` and `type` properties:
- `type: 'string'` - Cast to string
- `type: 'number'` - Cast to number
- `type: 'boolean'` - Cast to boolean

**Rules:**
- Takes exactly 3 arguments
- Cannot chain `where()` immediately after another `where()`
- Use `andWhere()`, `orWhere()`, `and()`, or `or()` for subsequent conditions

---

#### `andWhere(column, operator, value)`
Adds an AND condition to the query.

```javascript
const activeAdmins = await model
  .fromTable('users')
  .select('id', 'name')
  .where('status', '=', 'active')
  .andWhere('role', '=', 'admin')
// SQL: WHERE status = 'active' AND role = 'admin'
```

**Rules:**
- Must be chained after `where()` or another condition
- Cannot be called after `and()` or `or()` operators

---

#### `orWhere(column, operator, value)`
Adds an OR condition to the query.

```javascript
const privilegedUsers = await model
  .fromTable('users')
  .select('id', 'name', 'role')
  .where('role', '=', 'admin')
  .orWhere('role', '=', 'moderator')
// SQL: WHERE role = 'admin' OR role = 'moderator'
```

**Rules:**
- Must be chained after `where()` or another condition
- Cannot be called after `and()` or `or()` operators

---

#### `and()`
Adds AND logical operator (for use with `whereField()` or grouping).

```javascript
const users = await model
  .fromTable('users')
  .select('*')
  .where('status', '=', 'active')
  .and()
  .where('role', '=', 'admin')
// Alternative to andWhere()
```

**Rules:**
- Cannot end a query with `and()`
- Must be followed by another condition

---

#### `or()`
Adds OR logical operator (for use with `whereField()` or grouping).

```javascript
const users = await model
  .fromTable('users')
  .select('*')
  .where('status', '=', 'active')
  .or()
  .where('status', '=', 'pending')
// Alternative to orWhere()
```

**Rules:**
- Cannot end a query with `or()`
- Must be followed by another condition

---

### 9. WHERE IN / NOT IN Methods

#### `whereIn(column, list)`
Checks if column value is in the provided list.

```javascript
const privilegedUsers = await model
  .fromTable('users')
  .select('id', 'name', 'role')
  .whereIn('role', ['admin', 'moderator', 'editor'])
// SQL: WHERE role IN ('admin', 'moderator', 'editor')
```

**Rules:**
- `list` must be a non-empty array
- `column` must be a non-empty string

---

#### `whereNotIn(column, list)`
Checks if column value is NOT in the provided list.

```javascript
const activeUsers = await model
  .fromTable('users')
  .select('id', 'name', 'status')
  .whereNotIn('status', ['banned', 'deleted', 'suspended'])
// SQL: WHERE status NOT IN ('banned', 'deleted', 'suspended')
```

**Rules:**
- `list` must be a non-empty array
- `column` must be a non-empty string

---

### 10. Field-Based WHERE Methods

#### `whereField(column)`
Initiates a field-based condition chain. Must be followed by field operators.

```javascript
// Check for NULL
await model.fromTable('users').select('*').whereField('email_verified_at').isNull()

// Check for NOT NULL
await model.fromTable('users').select('*').whereField('deleted_at').isNotNull()

// BETWEEN
await model.fromTable('products').select('*').whereField('price').isBetween(10, 100)

// NOT BETWEEN
await model.fromTable('users').select('*').whereField('age').isNotBetween(13, 17)

// With logical operators
await model
  .fromTable('posts')
  .select('*')
  .whereField('likes')
  .isBetween(50, 100)
  .or()
  .whereField('views')
  .isBetween(1000, 5000)
```

**Available Field Operators:**

##### `isNull()`
Checks if field is NULL.

```javascript
const unverifiedUsers = await model
  .fromTable('users')
  .select('id', 'name')
  .whereField('email_verified_at')
  .isNull()
// SQL: WHERE email_verified_at IS NULL
```

##### `isNotNull()`
Checks if field is NOT NULL.

```javascript
const verifiedUsers = await model
  .fromTable('users')
  .select('id', 'name')
  .whereField('email_verified_at')
  .isNotNull()
// SQL: WHERE email_verified_at IS NOT NULL
```

##### `isBetween(start, end)`
Checks if field value is between two numbers.

```javascript
const products = await model
  .fromTable('products')
  .select('*')
  .whereField('price')
  .isBetween(100, 500)
// SQL: WHERE price BETWEEN 100 AND 500
```

**Rules:**
- Both `start` and `end` must be numbers

##### `isNotBetween(start, end)`
Checks if field value is NOT between two numbers.

```javascript
const users = await model
  .fromTable('users')
  .select('*')
  .whereField('age')
  .isNotBetween(13, 17)
// SQL: WHERE age NOT BETWEEN 13 AND 17
```

**Rules:**
- Both `start` and `end` must be numbers

---

### 11. Grouped Conditions

#### `andGroup(callback)`
Creates an AND grouped condition using a callback.

```javascript
const users = await model
  .fromTable('users')
  .select('id', 'name', 'role', 'department')
  .where('status', '=', 'active')
  .andGroup((builder) => {
    return builder
      .where('role', '=', 'admin')
      .orWhere('department', '=', 'IT')
  })
// SQL: WHERE status = 'active' AND (role = 'admin' OR department = 'IT')
```

**Nested Groups:**
```javascript
const complexQuery = await model
  .fromTable('users')
  .select('id', 'name')
  .where('status', '=', 'active')
  .andGroup((builder) => {
    return builder
      .where('role', '=', 'manager')
      .orGroup((nested) => {
        return nested
          .where('role', '=', 'admin')
          .andWhere('department', '=', 'HR')
      })
  })
// SQL: WHERE status = 'active' AND (role = 'manager' OR (role = 'admin' AND department = 'HR'))
```

---

#### `orGroup(callback)`
Creates an OR grouped condition using a callback.

```javascript
const users = await model
  .fromTable('users')
  .select('id', 'name')
  .where('status', '=', 'banned')
  .orGroup((builder) => {
    return builder
      .where('role', '=', 'admin')
      .andWhere('override', '=', true)
  })
// SQL: WHERE status = 'banned' OR (role = 'admin' AND override = true)
```

---

### 12. Pagination

#### `limit(number)`
Limits the number of results returned.

```javascript
const topTen = await model
  .fromTable('products')
  .select('*')
  .where('in_stock', '=', true)
  .limit(10)
// SQL: ... LIMIT 10
```

**Rules:**
- Must be a number
- Cannot be used at the top level (must follow other query methods)

---

#### `offset(number)`
Skips a specified number of results.

```javascript
// Get page 3 (assuming 20 items per page)
const page3 = await model
  .fromTable('products')
  .select('*')
  .limit(20)
  .offset(40)
// SQL: ... LIMIT 20 OFFSET 40
```

**Rules:**
- Must be a number
- Must be chained after `limit()`

---

### 13. Read-Only Properties

#### `state`
Returns the current query state (query parts and values).

```javascript
const query = model
  .fromTable('users')
  .select('id', 'name')
  .where('status', '=', 'active')

console.log(query.state)
// {
//   query: ['SELECT id, name FROM users', 'WHERE status = ?'],
//   values: ['active']
// }
```

---

#### `table`
Returns the current table name.

```javascript
const query = model.fromTable('users')
console.log(query.table) // 'users'
```

---

#### `operatorSignal`
Returns the current operator signal flag (internal state).

```javascript
const query = model.fromTable('users').where('id', '=', 1)
console.log(query.operatorSignal) // true
```

---

## 🔧 Environment Configuration

### Required Environment Variables

Create a `.env` file in your project root:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=your_database
DB_PORT=3306
CONNECTION_LIMIT=10
```

### Configuration Priority

1. **Constructor options** (highest priority)
2. **Environment variables** (from .env file)
3. **Default values** (fallback)

---

## 🎯 Method Chaining Rules

### Valid Chaining Patterns

```javascript
// Pattern 1: fromTable → query method → conditions
model.fromTable('users').select('*').where('id', '=', 1)

// Pattern 2: setTable → query method → conditions
model.setTable('users')
model.select('*').where('id', '=', 1)

// Pattern 3: Insert/Update/Delete first
model.fromTable('users').insert({...})
model.fromTable('users').update({...}).where('id', '=', 1)
model.fromTable('users').delete().where('id', '=', 1)
```

### Invalid Chaining Patterns

```javascript
// ❌ Cannot chain where() after where()
model.fromTable('users').select('*').where('id', '=', 1).where('status', '=', 'active')
// Use andWhere() or orWhere() instead

// ❌ Cannot call andWhere/orWhere after and()/or()
model.fromTable('users').select('*').where('id', '=', 1).and().andWhere('status', '=', 'active')

// ❌ Cannot end query with and()/or()
model.fromTable('users').select('*').where('id', '=', 1).and().done()

// ❌ fromTable() must be first
model.select('*').fromTable('users') // Error!

// ❌ insert/update cannot follow other methods
model.select('*').insert({...}) // Error!
```

---

## 🐛 Debug Mode

Enable debug logging using the `DEBUG` environment variable:

```bash
# Debug all miniORM operations
DEBUG=miniORM:* node app.js

# Debug only queries
DEBUG=miniORM:query node app.js

# Debug only database connections
DEBUG=miniORM:db node app.js

# Debug multiple namespaces
DEBUG=miniORM:*,examples:* node app.js
```

### Available Debug Namespaces

- `miniORM:query` - SQL queries and values
- `miniORM:db` - Connection pool events
- `miniORM:options` - Configuration options

---

## 📦 Dependencies

```json
{
  "dependencies": {
    "@dotenvx/dotenvx": "^1.51.0",
    "debug": "^4.4.3",
    "express": "^5.1.0",
    "mysql2": "^3.15.2"
  }
}
```

---

## ✅ Complete Usage Example

```javascript
import express from 'express'
import miniORM from './miniORM.js'

const app = express()
const model = new miniORM()

// GET: Fetch users with complex conditions
app.get('/users', async (req, res) => {
  try {
    const users = await model
      .fromTable('users')
      .select('id', 'name', 'email', 'role')
      .where('status', '=', 'active')
      .andGroup((builder) => {
        return builder
          .where('role', '=', 'admin')
          .orWhere('role', '=', 'moderator')
      })
      .limit(50)
    
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST: Create new user
app.post('/users', async (req, res) => {
  try {
    const result = await model
      .fromTable('users')
      .insert({
        name: req.body.name,
        email: req.body.email,
        role: 'user',
        created_at: new Date()
      })
    
    res.status(201).json({ id: result.insertId })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// PUT: Update user
app.put('/users/:id', async (req, res) => {
  try {
    const result = await model
      .fromTable('users')
      .update({
        name: req.body.name,
        email: req.body.email,
        updated_at: new Date()
      })
      .where('id', '=', { value: req.params.id, type: 'number' })
    
    res.json({ success: true, affected: result.affectedRows })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// DELETE: Remove user
app.delete('/users/:id', async (req, res) => {
  try {
    const result = await model
      .fromTable('users')
      .delete()
      .where('id', '=', { value: req.params.id, type: 'number' })
    
    res.json({ success: true, affected: result.affectedRows })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

app.listen(3000, () => {
  console.log('Server running on port 3000')
})
```

---

## 🚀 Best Practices

### 1. Always Use WHERE with UPDATE/DELETE
```javascript
// ✅ Good
await model.fromTable('users').delete().where('id', '=', 1)

// ⚠️ Dangerous - deletes all records!
await model.fromTable('users').delete()
```

### 2. Use Type Casting for User Input
```javascript
// ✅ Good - ensures type safety
await model
  .fromTable('users')
  .where('id', '=', { value: req.params.id, type: 'number' })

// ⚠️ Risky - might cause type mismatch
await model
  .fromTable('users')
  .where('id', '=', req.params.id)
```

### 3. Use Groups for Complex Logic
```javascript
// ✅ Good - clear intent with grouping
await model
  .fromTable('users')
  .select('*')
  .where('status', '=', 'active')
  .andGroup((builder) => {
    return builder
      .where('role', '=', 'admin')
      .orWhere('department', '=', 'IT')
  })
```

### 4. Inspect State for Debugging
```javascript
const query = model
  .fromTable('users')
  .select('*')
  .where('status', '=', 'active')

console.log('Query parts:', query.state.query)
console.log('Values:', query.state.values)

// Then execute
const results = await query.done()
```

---

## 📋 Summary of All Methods

| Method | Category | Description |
|--------|----------|-------------|
| `new miniORM()` | Core | Constructor |
| `fromTable()` | Core | Set table (must be first) |
| `setTable()` | Core | Set table (internal) |
| `done()` | Core | Execute query |
| `select()` | Query | SELECT columns |
| `selectAll()` | Query | SELECT * |
| `countRecords()` | Query | COUNT(*) |
| `insert()` | Query | INSERT record |
| `update()` | Query | UPDATE records |
| `delete()` | Query | DELETE records |
| `where()` | Condition | WHERE clause |
| `andWhere()` | Condition | AND WHERE |
| `orWhere()` | Condition | OR WHERE |
| `whereIn()` | Condition | WHERE IN |
| `whereNotIn()` | Condition | WHERE NOT IN |
| `whereField()` | Condition | Field-based WHERE |
| `isNull()` | Field Operator | IS NULL |
| `isNotNull()` | Field Operator | IS NOT NULL |
| `isBetween()` | Field Operator | BETWEEN |
| `isNotBetween()` | Field Operator | NOT BETWEEN |
| `and()` | Logical | AND operator |
| `or()` | Logical | OR operator |
| `andGroup()` | Logical | AND (grouped) |
| `orGroup()` | Logical | OR (grouped) |
| `limit()` | Pagination | LIMIT results |
| `offset()` | Pagination | OFFSET results |
| `state` | Property | Query state |
| `table` | Property | Table name |
| `operatorSignal` | Property | Operator flag |

---

## 📝 Notes

- All query methods return a new instance (immutable pattern)
- Connection pool is automatically managed (no manual close needed)
- Queries are Promise-like (can await directly or use `.done()`)
- Type casting available for string/number/boolean conversions
- Debug mode available via `DEBUG` environment variable

---

**END OF API SUMMARY**