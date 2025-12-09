# miniORM

A lightweight Object-Relational Mapping (ORM) library for Node.js with MySQL support and automatic connection pool management.

## Features

- **Immutable Builder Pattern**: Each query method returns a new instance, preserving immutability
- **Fluent Chainable API**: Readable methods like `model.fromTable('users').select('*')`
- **SELECT DISTINCT Support**: Get unique values with the new `distinct()` method ✨
- **Field-based IN/NOT IN**: Enhanced `whereField()` with `in()` and `notIn()` operators ✨
- **Promise-like Interface**: Await queries directly or call `.done()` explicitly
- **Singleton Connection Pool**: Single shared pool across all miniORM instances with automatic cleanup
- **Flexible WHERE Conditions**: Support for complex conditions with operators, IN/NOT IN, NULL checks, and BETWEEN ranges
- **Logical Operators**: Chain conditions with AND/OR operators, `orWhere()`, `andWhere()` methods, and grouping with `andGroup()`/`orGroup()`
- **Field-based Conditions**: Use `whereField()` for specialized operations like `isNull()`, `isBetween()`, `in()`, `notIn()`, etc.
- **Type Casting**: Automatic type conversion for query values
- **Auto Resource Management**: Connection pool automatically closes on process exit (SIGINT, SIGTERM)
- **Debug Support**: Built-in debugging with configurable namespaces via the `debug` package
- **ES6 Module Support**: Full ESM compatibility

## Installation

```bash
npm install mysql2 debug @dotenvx/dotenvx
```

## Environment Setup

Create a `.env` file in your project root with your database configuration:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=your_database
DB_PORT=3306
CONNECTION_LIMIT=10
```

## Quick Start

```javascript
import miniORM from './miniORM.js'

const model = new miniORM()

// Select all users (can await directly without .done())
const allUsers = await model.fromTable('users').selectAll()

// Select specific columns with WHERE condition
const activeUsers = await model
  .fromTable('users')
  .select('id', 'name', 'email')
  .where('status', '=', 'active')

// NEW: Get unique values with distinct()
const uniqueEmails = await model
  .fromTable('users')
  .select()
  .distinct('email')

// NEW: Use whereField().in() for cleaner syntax
const featuredPosts = await model
  .fromTable('posts')
  .select('*')
  .whereField('author')
  .in(['John Doe', 'Jane Smith', 'Bob Wilson'])

// Insert a new user
const insertResult = await model
  .fromTable('users')
  .insert({
    name: 'John Doe',
    email: 'john@example.com',
    status: 'active'
  })

// Complex conditions with AND/OR
const adminUsers = await model
  .fromTable('users')
  .select('id', 'name')
  .where('status', '=', 'active')
  .andWhere('role', '=', 'admin')

// Using grouped conditions with new in() operator
const complexUsers = await model
  .fromTable('users')
  .select('id', 'name', 'role')
  .where('status', '=', 'active')
  .andGroup((builder) => {
    return builder
      .whereField('role').in(['admin', 'moderator'])
      .orWhere('department', '=', 'IT')
  })

// Update records
const updateResult = await model
  .fromTable('users')
  .update({ status: 'inactive', updated_at: new Date() })
  .where('last_login', '<', '2025-01-01')
```

## What's New ✨

### Version 1.0.0 Update (2025)

**New Features:**
- ✨ **`distinct(...columns)`** - Get unique values from columns
- ✨ **`in(list)`** - Field operator for IN conditions after `whereField()`
- ✨ **`notIn(list)`** - Field operator for NOT IN conditions after `whereField()`
- ✨ **`select()` enhanced** - Now supports being called without arguments

**Examples:**

```javascript
// Get unique departments
await model.fromTable('users').select().distinct('department')

// Filter by multiple authors (more readable)
await model
  .fromTable('posts')
  .select('*')
  .whereField('author')
  .in(['John', 'Jane', 'Bob'])

// Exclude banned users
await model
  .fromTable('users')
  .select('*')
  .whereField('status')
  .notIn(['banned', 'deleted', 'suspended'])
```

## API Reference

### Core Methods

#### `new miniORM(options?)`
Create a new miniORM instance with optional database configuration.

```javascript
// Use environment variables
const model = new miniORM()

// Override with custom options
const model = new miniORM({
  host: 'custom-host',
  user: 'custom-user',
  password: 'custom-password',
  database: 'custom-database',
  port: 3306,
  connectionLimit: 10
})
```

#### `fromTable(tableName)`
Sets the table and returns a new instance. Must be called first in the chain.

```javascript
const users = await model.fromTable('users').selectAll()
const posts = await model.fromTable('posts').select('id', 'title')
```

#### `setTable(tableName)`
Internal method to set the table name. Used with persistent model instances.

```javascript
model.setTable('users')
const all = await model.selectAll().done()
const active = await model.select('id', 'name').where('status', '=', 'active').done()
```

#### `done()`
Executes the query and returns results. Queries can also be awaited directly without calling `.done()`.

```javascript
const results = await model.fromTable('users').selectAll().done()
// Or simply:
const results = await model.fromTable('users').selectAll()
```

---

### Query Building Methods

#### `select(...columns)` ✨ Enhanced
Selects specific columns from the table. Now supports being called without arguments.

```javascript
// Single column
const names = await model.fromTable('users').select('name')

// Multiple columns
const userInfo = await model.fromTable('users').select('id', 'name', 'email')

// No arguments (for use with distinct() or other modifiers)
const query = await model.fromTable('users').select().distinct('email')
```

#### `distinct(...columns)` ✨ NEW
Returns unique values from specified columns. Must be chained after `select()`.

```javascript
// Get unique email addresses
const uniqueEmails = await model
  .fromTable('users')
  .select()
  .distinct('email')

// Get unique combinations
const uniqueCombos = await model
  .fromTable('orders')
  .select()
  .distinct('customer_id', 'product_id')

// With WHERE conditions
const activeDepts = await model
  .fromTable('users')
  .select()
  .distinct('department')
  .where('status', '=', 'active')
```

**Rules:**
- Must be chained after `select()`
- Requires at least one column
- No empty, null, or undefined column names allowed

#### `selectAll()`
Selects all columns (equivalent to `SELECT *`).

```javascript
const allUsers = await model.fromTable('users').selectAll()
```

#### `countRecords()`
Returns the count of records in the table.

```javascript
const count = await model.fromTable('users').countRecords()
// Returns: [{ recordsCount: 42 }]
```

#### `insert(details)`
Inserts a new record into the table.

```javascript
const result = await model
  .fromTable('users')
  .insert({
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin',
    created_at: new Date()
  })

console.log(result.insertId) // Auto-increment ID
```

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
  .where('last_login', '<', '2025-01-01')

// Bulk update with complex conditions
const result = await model
  .fromTable('users')
  .update({ view_count: 0 })
  .where('status', '=', 'archived')
  .andWhere('created_at', '<', '2024-01-01')
```

#### `delete()`
Deletes records from the table.

```javascript
// Delete with WHERE condition
const result = await model
  .fromTable('users')
  .delete()
  .where('status', '=', 'banned')

// Delete excluding certain values (using new notIn())
const result = await model
  .fromTable('sessions')
  .delete()
  .whereField('user_id')
  .notIn([1, 2, 3]) // Protect admin sessions
```

#### `limit(number)`
Limits the number of results returned.

```javascript
const topTen = await model
  .fromTable('products')
  .select('*')
  .where('in_stock', '=', true)
  .limit(10)
```

#### `offset(number)`
Skips a specified number of results. Must be chained after `limit()`.

```javascript
// Get page 3 (assuming 20 items per page)
const page3 = await model
  .fromTable('products')
  .select('*')
  .limit(20)
  .offset(40)
```

---

### WHERE Clause Methods

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
- `=`, `!=`, `<>` (not equal)
- `>`, `>=`, `<`, `<=` (comparison)
- `LIKE`, `NOT LIKE` (pattern matching)

**Type Casting:**
Pass value as object with `value` and `type` properties:
- `type: 'string'` - Cast to string
- `type: 'number'` - Cast to number
- `type: 'boolean'` - Cast to boolean

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

#### `whereIn(column, list)`
Checks if column value is in the provided list.

```javascript
const privilegedUsers = await model
  .fromTable('users')
  .select('id', 'name', 'role')
  .whereIn('role', ['admin', 'moderator', 'editor'])
// SQL: WHERE role IN ('admin', 'moderator', 'editor')
```

#### `whereNotIn(column, list)`
Checks if column value is NOT in the provided list.

```javascript
const activeUsers = await model
  .fromTable('users')
  .select('id', 'name', 'status')
  .whereNotIn('status', ['banned', 'deleted', 'suspended'])
// SQL: WHERE status NOT IN ('banned', 'deleted', 'suspended')
```

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

// IN - NEW!
await model.fromTable('posts').select('*').whereField('author').in(['John', 'Jane', 'Bob'])

// NOT IN - NEW!
await model.fromTable('users').select('*').whereField('status').notIn(['banned', 'deleted'])
```

---

### Field Operators (After `whereField()`)

#### `isNull()`
Checks if field is NULL.

```javascript
const unverifiedUsers = await model
  .fromTable('users')
  .select('id', 'name')
  .whereField('email_verified_at')
  .isNull()
// SQL: WHERE email_verified_at IS NULL
```

#### `isNotNull()`
Checks if field is NOT NULL.

```javascript
const verifiedUsers = await model
  .fromTable('users')
  .select('id', 'name')
  .whereField('email_verified_at')
  .isNotNull()
// SQL: WHERE email_verified_at IS NOT NULL
```

#### `isBetween(start, end)`
Checks if field value is between two numbers.

```javascript
const products = await model
  .fromTable('products')
  .select('*')
  .whereField('price')
  .isBetween(100, 500)
// SQL: WHERE price BETWEEN 100 AND 500
```

#### `isNotBetween(start, end)`
Checks if field value is NOT between two numbers.

```javascript
const users = await model
  .fromTable('users')
  .select('*')
  .whereField('age')
  .isNotBetween(13, 17)
// SQL: WHERE age NOT BETWEEN 13 AND 17
```

#### `in(list)` ✨ NEW
Checks if field value is in the provided list. More readable alternative to `whereIn()` in complex chains.

```javascript
const posts = await model
  .fromTable('posts')
  .select('*')
  .whereField('author')
  .in(['John Doe', 'Jane Smith', 'Bob Wilson'])
// SQL: WHERE author IN ('John Doe', 'Jane Smith', 'Bob Wilson')

// In complex chains
const results = await model
  .fromTable('users')
  .select('*')
  .whereField('role').in(['admin', 'moderator'])
  .or()
  .whereField('department').in(['IT', 'HR'])
```

**Rules:**
- Must follow `whereField()`
- List must be a non-empty array

#### `notIn(list)` ✨ NEW
Checks if field value is NOT in the provided list.

```javascript
const users = await model
  .fromTable('users')
  .select('*')
  .whereField('status')
  .notIn(['banned', 'deleted', 'suspended'])
// SQL: WHERE status NOT IN ('banned', 'deleted', 'suspended')

// Safe DELETE operations
const result = await model
  .fromTable('sessions')
  .delete()
  .whereField('user_id')
  .notIn([1, 2, 3]) // Protect admin user sessions
```

**Rules:**
- Must follow `whereField()`
- List must be a non-empty array

---

### Logical Operators

#### `and()`
Adds AND logical operator.

```javascript
const users = await model
  .fromTable('users')
  .select('*')
  .where('status', '=', 'active')
  .and()
  .where('role', '=', 'admin')
```

#### `or()`
Adds OR logical operator.

```javascript
const users = await model
  .fromTable('users')
  .select('*')
  .where('status', '=', 'active')
  .or()
  .where('status', '=', 'pending')
```

#### `andGroup(callback)`
Creates an AND grouped condition using a callback.

```javascript
const users = await model
  .fromTable('users')
  .select('id', 'name', 'role', 'department')
  .where('status', '=', 'active')
  .andGroup((builder) => {
    return builder
      .whereField('role').in(['admin', 'moderator'])
      .orWhere('department', '=', 'IT')
  })
// SQL: WHERE status = 'active' AND (role IN ('admin', 'moderator') OR department = 'IT')
```

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

### Properties (Read-only)

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

#### `table`
Returns the current table name.

```javascript
const query = model.fromTable('users')
console.log(query.table) // 'users'
```

#### `operatorSignal`
Returns the current operator signal flag (internal state).

```javascript
const query = model.fromTable('users').where('id', '=', 1)
console.log(query.operatorSignal) // true
```

---

## Express Integration

### Complete REST API Example

```javascript
import express from 'express'
import miniORM from './miniORM.js'

const app = express()
const model = new miniORM()

app.use(express.json())

// GET: Fetch unique categories
app.get('/categories', async (req, res) => {
  try {
    const categories = await model
      .fromTable('products')
      .select()
      .distinct('category')
    
    res.json(categories)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET: Fetch posts by featured authors
app.get('/posts/featured', async (req, res) => {
  try {
    const posts = await model
      .fromTable('posts')
      .select('id', 'title', 'author', 'created_at')
      .whereField('author')
      .in(['John Doe', 'Jane Smith', 'Bob Wilson'])
      .andWhere('published', '=', true)
    
    res.json(posts)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET: Fetch active users (excluding banned)
app.get('/users', async (req, res) => {
  try {
    const users = await model
      .fromTable('users')
      .select('id', 'name', 'email', 'role')
      .whereField('status')
      .notIn(['banned', 'deleted', 'suspended'])
      .andWhere('email_verified', '=', true)
    
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

// DELETE: Remove user (protecting admins)
app.delete('/users/:id', async (req, res) => {
  try {
    const result = await model
      .fromTable('users')
      .delete()
      .where('id', '=', { value: req.params.id, type: 'number' })
      .andWhere((builder) => {
        return builder
          .whereField('role')
          .notIn(['admin', 'superadmin'])
      })
    
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

## Error Handling

### Query Validation Errors

```javascript
try {
  // Invalid: empty column name
  await model.fromTable('users').select('')
} catch (error) {
  console.error(error.message)
  // "List of columns can't include [empty, null or undefined] column(s) name(s)!"
}

try {
  // Invalid: distinct() without columns
  await model.fromTable('users').select().distinct()
} catch (error) {
  console.error(error.message)
  // "Column or columns, required!"
}

try {
  // Invalid: distinct() without select()
  await model.fromTable('users').distinct('email')
} catch (error) {
  console.error(error.message)
  // Error about method positioning
}
```

### WHERE Condition Errors

```javascript
try {
  // Invalid: chaining where() after where()
  await model
    .fromTable('users')
    .select('*')
    .where('status', '=', 'active')
    .where('role', '=', 'admin') // Wrong!
} catch (error) {
  console.error(error.message)
  // Use andWhere() or orWhere() instead
}

try {
  // Invalid: in() with empty array
  await model
    .fromTable('users')
    .select('*')
    .whereField('role')
    .in([]) // Wrong!
} catch (error) {
  console.error(error.message)
  // "List should be an array type and not empty!"
}

try {
  // Invalid: in() without whereField()
  await model
    .fromTable('users')
    .select('*')
    .in(['admin', 'moderator']) // Wrong!
} catch (error) {
  console.error(error.message)
  // Must use whereField() first
}
```

---

## Debug Mode

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

**Available Debug Namespaces:**
- `miniORM:query` - SQL queries and values
- `miniORM:db` - Connection pool events
- `miniORM:options` - Configuration options

---

## Connection Management

### Automatic Features

- **Singleton Pattern**: All miniORM instances share the same connection pool
- **Auto-cleanup**: Pool automatically closes on process exit (SIGINT, SIGTERM)
- **No Manual Cleanup**: No need to call `.close()` or `.end()` methods

### Configuration Priority

1. **Constructor options** (highest priority)
2. **Environment variables** (from .env file)
3. **Default values** (fallback)

Example:

```javascript
// This configuration takes precedence over .env variables
const model = new miniORM({
  host: 'production-db.example.com',
  user: 'prod_user',
  password: 'prod_password',
  database: 'prod_database',
  connectionLimit: 20
})
```

---

## Best Practices

### 1. Always Use WHERE with UPDATE/DELETE

```javascript
// ✅ Good - specific deletion
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

### 3. Use distinct() for Unique Values

```javascript
// ✅ Good - efficient database query
await model.fromTable('users').select().distinct('email')

// ⚠️ Less efficient - requires post-processing
const users = await model.fromTable('users').select('email')
const unique = [...new Set(users.map(u => u.email))]
```

### 4. Choose Between whereIn() and whereField().in()

```javascript
// ✅ Both are valid - use what reads better

// Traditional approach
.whereIn('status', ['active', 'pending'])

// New field-based approach (more readable in chains)
.whereField('status').in(['active', 'pending'])
```

### 5. Use Groups for Complex Logic

```javascript
// ✅ Good - clear intent with grouping
await model
  .fromTable('users')
  .select('*')
  .where('status', '=', 'active')
  .andGroup((builder) => {
    return builder
      .whereField('role').in(['admin', 'moderator'])
      .orWhere('department', '=', 'IT')
  })
```

### 6. Protect Sensitive Operations

```javascript
// ✅ Good - protects admin accounts
await model
  .fromTable('users')
  .delete()
  .where('last_login', '<', '2024-01-01')
  .andWhere((builder) => {
    return builder
      .whereField('role')
      .notIn(['admin', 'superadmin'])
  })
```

---

## Method Chaining Rules

### Valid Patterns ✅

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

// Pattern 4: select() with distinct() ✨ NEW
model.fromTable('users').select().distinct('email')
model.fromTable('orders').select().distinct('customer_id', 'product_id')

// Pattern 5: whereField() with in()/notIn() ✨ NEW
model.fromTable('posts').select('*').whereField('author').in(['John', 'Jane'])
model.fromTable('users').select('*').whereField('status').notIn(['banned'])
```

### Invalid Patterns ❌

```javascript
// ❌ Cannot chain where() after where()
model.fromTable('users').select('*').where('id', '=', 1).where('status', '=', 'active')
// Use andWhere() or orWhere() instead

// ❌ Cannot use offset() without limit()
model.select('*').offset(20)

// ❌ fromTable() must be first
model.select('*').fromTable('users')

// ❌ Cannot end query with and()/or()
model.fromTable('users').select('*').where('id', '=', 1).and().done()

// ❌ distinct() requires columns
model.fromTable('users').select().distinct()

// ❌ distinct() requires select()
model.fromTable('users').distinct('email')

// ❌ in()/notIn() require whereField()
model.fromTable('users').select('*').in(['admin'])
```

---

## Complete Method Reference

| Method | Category | Description | New |
|--------|----------|-------------|-----|
| `new miniORM()` | Core | Constructor | |
| `fromTable()` | Core | Set table (must be first) | |
| `setTable()` | Core | Set table (internal) | |
| `done()` | Core | Execute query | |
| `select()` | Query | SELECT columns | ✨ Enhanced |
| `distinct()` | Query | SELECT DISTINCT | ✨ NEW |
| `selectAll()` | Query | SELECT * | |
| `countRecords()` | Query | COUNT(*) | |
| `insert()` | Query | INSERT record | |
| `update()` | Query | UPDATE records | |
| `delete()` | Query | DELETE records | |
| `where()` | Condition | WHERE clause | |
| `andWhere()` | Condition | AND WHERE | |
| `orWhere()` | Condition | OR WHERE | |
| `whereIn()` | Condition | WHERE IN | |
| `whereNotIn()` | Condition | WHERE NOT IN | |
| `whereField()` | Condition | Field-based WHERE | |
| `isNull()` | Field Operator | IS NULL | |
| `isNotNull()` | Field Operator | IS NOT NULL | |
| `isBetween()` | Field Operator | BETWEEN | |
| `isNotBetween()` | Field Operator | NOT BETWEEN | |
| `in()` | Field Operator | IN (after whereField) | ✨ NEW |
| `notIn()` | Field Operator | NOT IN (after whereField) | ✨ NEW |
| `and()` | Logical | AND operator | |
| `or()` | Logical | OR operator | |
| `andGroup()` | Logical | AND (grouped) | |
| `orGroup()` | Logical | OR (grouped) | |
| `limit()` | Pagination | LIMIT results | |
| `offset()` | Pagination | OFFSET results | |
| `state` | Property | Query state | |
| `table` | Property | Table name | |
| `operatorSignal` | Property | Operator flag | |