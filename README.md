<div align="center">
  <img src="./assets/mysqlizer-logo.png" alt="mySQLizer Logo" width="400">
  
  # mySQLizer
  
  <p><strong>A lightweight, fluent MySQL query builder for Node.js</strong></p>
  <p>Automatic connection pool management • Immutable builder pattern • Promise-based API</p>
  
  [![npm version](https://badge.fury.io/js/mysqlizer.svg)](https://www.npmjs.com/package/mysqlizer)
  [![npm downloads](https://img.shields.io/npm/dm/mysqlizer.svg)](https://www.npmjs.com/package/mysqlizer)
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)](https://nodejs.org)
  
</div>

---

## What is mySQLizer?

**mySQLizer is a MySQL query builder**, not a full-featured ORM. It provides a clean, chainable API for building and executing MySQL queries without the complexity and overhead of traditional ORMs. Perfect for developers who want more control than raw SQL strings but less abstraction than TypeORM or Sequelize.

### Query Builder vs ORM

- ✅ **Query Builder** (mySQLizer): Fluent API for building SQL queries, direct database interaction
- ❌ **ORM**: Model definitions, relationships, migrations, schema management, active records

## Features

- **Immutable Builder Pattern**: Each query method returns a new instance, preserving immutability
- **Fluent Chainable API**: Readable methods like `db.fromTable('users').select('*')`
- **SELECT DISTINCT Support**: Get unique values with the `distinct()` method ✨
- **Field-based IN/NOT IN**: Enhanced `whereField()` with `in()` and `notIn()` operators ✨
- **Promise-like Interface**: Await queries directly or call `.done()` explicitly
- **Singleton Connection Pool**: Single shared pool across all mySQLizer instances with automatic cleanup
- **Flexible WHERE Conditions**: Support for complex conditions with operators, IN/NOT IN, NULL checks, and BETWEEN ranges
- **Logical Operators**: Chain conditions with AND/OR operators, `orWhere()`, `andWhere()` methods, and grouping with `andGroup()`/`orGroup()`
- **Field-based Conditions**: Use `whereField()` for specialized operations like `isNull()`, `isBetween()`, `in()`, `notIn()`, etc.
- **Type Casting**: Explicit type conversion for query values
- **Auto Resource Management**: Connection pool automatically closes on process exit (SIGINT, SIGTERM)
- **Debug Support**: Built-in debugging with configurable namespaces via the `debug` package
- **ES6 Module Support**: Full ESM compatibility

## Installation

### NPM Package

Install mySQLizer v1.0.0 from npm:

```bash
npm install mysqlizer
```

**What's included:**
- ✅ mySQLizer query builder core
- ✅ mysql2 (MySQL driver with promise support)
- ✅ debug (debugging utility)
- ✅ @dotenvx/dotenvx (environment variable management)

### Alternative: Install with specific dependencies

If you prefer to manage dependencies separately:

```bash
npm install mysqlizer mysql2 debug @dotenvx/dotenvx
```

**Note:** `mysql2` is a peer dependency and is required for mySQLizer to work.

## Getting Started

### Step 1: Install the package

```bash
npm install mysqlizer
```

### Step 2: Set up your environment variables

Create a `.env` file in your project root with your database configuration:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=your_database
DB_PORT=3306
CONNECTION_LIMIT=10
```

### Step 3: Import and use mySQLizer

```javascript
import mySQLizer from 'mysqlizer'

// Create a new instance (uses environment variables automatically)
const db = new mySQLizer()

// Start building queries!
const users = await db
  .fromTable('users')
  .selectAll()
  .where('status', '=', 'active')
```

### Step 4: Optional - Custom configuration

Override environment variables with custom options:

```javascript
const db = new mySQLizer({
  host: 'custom-host.com',
  user: 'custom-user',
  password: 'custom-password',
  database: 'custom-database',
  port: 3306,
  connectionLimit: 20
})
```

### Step 5: Verify installation

Test your setup with a simple query:

```javascript
import mySQLizer from 'mysqlizer'

const db = new mySQLizer()

// Test connection and query
try {
  const result = await db
    .fromTable('users')
    .countRecords()
  
  console.log('✅ mySQLizer connected successfully!')
  console.log('Total users:', result[0].recordsCount)
} catch (error) {
  console.error('❌ Connection failed:', error.message)
}
```

**Troubleshooting:**
- Ensure MySQL server is running
- Verify database credentials in `.env`
- Check that the database and table exist
- Confirm `mysql2` is installed: `npm list mysql2`

## Quick Start Examples

```javascript
import mySQLizer from 'mysqlizer'

const db = new mySQLizer()

// Select all users (can await directly without .done())
const allUsers = await db.fromTable('users').selectAll()

// Select specific columns with WHERE condition
const activeUsers = await db
  .fromTable('users')
  .select('id', 'name', 'email')
  .where('status', '=', 'active')

// NEW: Get unique values with distinct()
const uniqueEmails = await db
  .fromTable('users')
  .select()
  .distinct('email')

// NEW: Use whereField().in() for cleaner syntax
const featuredPosts = await db
  .fromTable('posts')
  .select('*')
  .whereField('author')
  .in(['John Doe', 'Jane Smith', 'Bob Wilson'])

// Insert a new user
const insertResult = await db
  .fromTable('users')
  .insert({
    name: 'John Doe',
    email: 'john@example.com',
    status: 'active'
  })

// Complex conditions with AND/OR
const adminUsers = await db
  .fromTable('users')
  .select('id', 'name')
  .where('status', '=', 'active')
  .andWhere('role', '=', 'admin')

// Using grouped conditions with new in() operator
const complexUsers = await db
  .fromTable('users')
  .select('id', 'name', 'role')
  .where('status', '=', 'active')
  .andGroup((builder) => {
    return builder
      .whereField('role').in(['admin', 'moderator'])
      .orWhere('department', '=', 'IT')
  })

// Update records
const updateResult = await db
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
await db.fromTable('users').select().distinct('department')

// Filter by multiple authors (more readable)
await db
  .fromTable('posts')
  .select('*')
  .whereField('author')
  .in(['John', 'Jane', 'Bob'])

// Exclude banned users
await db
  .fromTable('users')
  .select('*')
  .whereField('status')
  .notIn(['banned', 'deleted', 'suspended'])
```

## API Reference

### Core Methods

#### `new mySQLizer(options?)`
Create a new mySQLizer instance with optional database configuration.

```javascript
// Use environment variables
const db = new mySQLizer()

// Override with custom options
const db = new mySQLizer({
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
const users = await db.fromTable('users').selectAll()
const posts = await db.fromTable('posts').select('id', 'title')
```

#### `setTable(tableName)`
Internal method to set the table name. Used with persistent query builder instances.

```javascript
db.setTable('users')
const all = await db.selectAll().done()
const active = await db.select('id', 'name').where('status', '=', 'active').done()
```

#### `done()`
Executes the query and returns results. Queries can also be awaited directly without calling `.done()`.

```javascript
const results = await db.fromTable('users').selectAll().done()
// Or simply:
const results = await db.fromTable('users').selectAll()
```

---

### Query Building Methods

#### `select(...columns)` ✨ Enhanced
Selects specific columns from the table. Now supports being called without arguments.

```javascript
// Single column
const names = await db.fromTable('users').select('name')

// Multiple columns
const userInfo = await db.fromTable('users').select('id', 'name', 'email')

// No arguments (for use with distinct() or other modifiers)
const query = await db.fromTable('users').select().distinct('email')
```

#### `distinct(...columns)` ✨ NEW
Returns unique values from specified columns. Must be chained after `select()`.

```javascript
// Get unique email addresses
const uniqueEmails = await db
  .fromTable('users')
  .select()
  .distinct('email')

// Get unique combinations
const uniqueCombos = await db
  .fromTable('orders')
  .select()
  .distinct('customer_id', 'product_id')

// With WHERE conditions
const activeDepts = await db
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
const allUsers = await db.fromTable('users').selectAll()
```

#### `countRecords()`
Returns the count of records in the table.

```javascript
const count = await db.fromTable('users').countRecords()
// Returns: [{ recordsCount: 42 }]
```

#### `insert(details)`
Inserts a new record into the table.

```javascript
const result = await db
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
const result = await db
  .fromTable('users')
  .update({
    status: 'inactive',
    updated_at: new Date()
  })
  .where('last_login', '<', '2025-01-01')

// Bulk update with complex conditions
const result = await db
  .fromTable('users')
  .update({ view_count: 0 })
  .where('status', '=', 'archived')
  .andWhere('created_at', '<', '2024-01-01')
```

#### `delete()`
Deletes records from the table.

```javascript
// Delete with WHERE condition
const result = await db
  .fromTable('users')
  .delete()
  .where('status', '=', 'banned')

// Delete excluding certain values (using new notIn())
const result = await db
  .fromTable('sessions')
  .delete()
  .whereField('user_id')
  .notIn([1, 2, 3]) // Protect admin sessions
```

#### `limit(number)`
Limits the number of results returned.

```javascript
const topTen = await db
  .fromTable('products')
  .select('*')
  .where('in_stock', '=', true)
  .limit(10)
```

#### `offset(number)`
Skips a specified number of results. Must be chained after `limit()`.

```javascript
// Get page 3 (assuming 20 items per page)
const page3 = await db
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
await db.fromTable('users').select('*').where('status', '=', 'active')

// With comparison operators
await db.fromTable('products').select('*').where('price', '>', 100)
await db.fromTable('users').select('*').where('age', '>=', 18)

// With LIKE operator
await db.fromTable('users').select('*').where('name', 'LIKE', '%John%')

// With type casting
await db.fromTable('users').select('*').where('age', '>', { value: '18', type: 'number' })
await db.fromTable('users').select('*').where('is_verified', '=', { value: 'true', type: 'boolean' })
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
const activeAdmins = await db
  .fromTable('users')
  .select('id', 'name')
  .where('status', '=', 'active')
  .andWhere('role', '=', 'admin')
// SQL: WHERE status = 'active' AND role = 'admin'
```

#### `orWhere(column, operator, value)`
Adds an OR condition to the query.

```javascript
const privilegedUsers = await db
  .fromTable('users')
  .select('id', 'name', 'role')
  .where('role', '=', 'admin')
  .orWhere('role', '=', 'moderator')
// SQL: WHERE role = 'admin' OR role = 'moderator'
```

#### `whereIn(column, list)`
Checks if column value is in the provided list.

```javascript
const privilegedUsers = await db
  .fromTable('users')
  .select('id', 'name', 'role')
  .whereIn('role', ['admin', 'moderator', 'editor'])
// SQL: WHERE role IN ('admin', 'moderator', 'editor')
```

#### `whereNotIn(column, list)`
Checks if column value is NOT in the provided list.

```javascript
const activeUsers = await db
  .fromTable('users')
  .select('id', 'name', 'status')
  .whereNotIn('status', ['banned', 'deleted', 'suspended'])
// SQL: WHERE status NOT IN ('banned', 'deleted', 'suspended')
```

#### `whereField(column)`
Initiates a field-based condition chain. Must be followed by field operators.

```javascript
// Check for NULL
await db.fromTable('users').select('*').whereField('email_verified_at').isNull()

// Check for NOT NULL
await db.fromTable('users').select('*').whereField('deleted_at').isNotNull()

// BETWEEN
await db.fromTable('products').select('*').whereField('price').isBetween(10, 100)

// NOT BETWEEN
await db.fromTable('users').select('*').whereField('age').isNotBetween(13, 17)

// IN - NEW!
await db.fromTable('posts').select('*').whereField('author').in(['John', 'Jane', 'Bob'])

// NOT IN - NEW!
await db.fromTable('users').select('*').whereField('status').notIn(['banned', 'deleted'])
```

---

### Field Operators (After `whereField()`)

#### `isNull()`
Checks if field is NULL.

```javascript
const unverifiedUsers = await db
  .fromTable('users')
  .select('id', 'name')
  .whereField('email_verified_at')
  .isNull()
// SQL: WHERE email_verified_at IS NULL
```

#### `isNotNull()`
Checks if field is NOT NULL.

```javascript
const verifiedUsers = await db
  .fromTable('users')
  .select('id', 'name')
  .whereField('email_verified_at')
  .isNotNull()
// SQL: WHERE email_verified_at IS NOT NULL
```

#### `isBetween(start, end)`
Checks if field value is between two numbers.

```javascript
const products = await db
  .fromTable('products')
  .select('*')
  .whereField('price')
  .isBetween(100, 500)
// SQL: WHERE price BETWEEN 100 AND 500
```

#### `isNotBetween(start, end)`
Checks if field value is NOT between two numbers.

```javascript
const users = await db
  .fromTable('users')
  .select('*')
  .whereField('age')
  .isNotBetween(13, 17)
// SQL: WHERE age NOT BETWEEN 13 AND 17
```

#### `in(list)` ✨ NEW
Checks if field value is in the provided list. More readable alternative to `whereIn()` in complex chains.

```javascript
const posts = await db
  .fromTable('posts')
  .select('*')
  .whereField('author')
  .in(['John Doe', 'Jane Smith', 'Bob Wilson'])
// SQL: WHERE author IN ('John Doe', 'Jane Smith', 'Bob Wilson')

// In complex chains
const results = await db
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
const users = await db
  .fromTable('users')
  .select('*')
  .whereField('status')
  .notIn(['banned', 'deleted', 'suspended'])
// SQL: WHERE status NOT IN ('banned', 'deleted', 'suspended')

// Safe DELETE operations
const result = await db
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
const users = await db
  .fromTable('users')
  .select('*')
  .where('status', '=', 'active')
  .and()
  .where('role', '=', 'admin')
```

#### `or()`
Adds OR logical operator.

```javascript
const users = await db
  .fromTable('users')
  .select('*')
  .where('status', '=', 'active')
  .or()
  .where('status', '=', 'pending')
```

#### `andGroup(callback)`
Creates an AND grouped condition using a callback.

```javascript
const users = await db
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
const users = await db
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
const query = db
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
const query = db.fromTable('users')
console.log(query.table) // 'users'
```

#### `operatorSignal`
Returns the current operator signal flag (internal state).

```javascript
const query = db.fromTable('users').where('id', '=', 1)
console.log(query.operatorSignal) // true
```

---

## Express Integration

### Complete REST API Example

```javascript
import express from 'express'
import mySQLizer from 'mysqlizer'

const app = express()
const db = new mySQLizer()

app.use(express.json())

// GET: Fetch unique categories
app.get('/categories', async (req, res) => {
  try {
    const categories = await db
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
    const posts = await db
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
    const users = await db
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
    const result = await db
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
    const result = await db
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
    const result = await db
      .fromTable('users')
      .delete()
      .where('id', '=', { value: req.params.id, type: 'number' })
      .andGroup((builder) => {
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
  await db.fromTable('users').select('')
} catch (error) {
  console.error(error.message)
  // "List of columns can't include [empty, null or undefined] column(s) name(s)!"
}

try {
  // Invalid: distinct() without columns
  await db.fromTable('users').select().distinct()
} catch (error) {
  console.error(error.message)
  // "Column or columns, required!"
}

try {
  // Invalid: distinct() without select()
  await db.fromTable('users').distinct('email')
} catch (error) {
  console.error(error.message)
  // Error about method positioning
}
```

### WHERE Condition Errors

```javascript
try {
  // Invalid: chaining where() after where()
  await db
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
  await db
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
  await db
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
# Debug all mySQLizer operations
DEBUG=mySQLizer:* node app.js

# Debug only queries
DEBUG=mySQLizer:query node app.js

# Debug only database connections
DEBUG=mySQLizer:db node app.js

# Debug multiple namespaces
DEBUG=mySQLizer:*,app:* node app.js
```

**Available Debug Namespaces:**
- `mySQLizer:query` - SQL queries and values
- `mySQLizer:db` - Connection pool events
- `mySQLizer:options` - Configuration options

---

## Connection Management

### Automatic Features

- **Singleton Pattern**: All mySQLizer instances share the same connection pool
- **Auto-cleanup**: Pool automatically closes on process exit (SIGINT, SIGTERM)
- **No Manual Cleanup**: No need to call `.close()` or `.end()` methods

### Configuration Priority

1. **Constructor options** (highest priority)
2. **Environment variables** (from .env file)
3. **Default values** (fallback)

Example:

```javascript
// This configuration takes precedence over .env variables
const db = new mySQLizer({
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
await db.fromTable('users').delete().where('id', '=', 1)

// ⚠️ Dangerous - deletes all records!
await db.fromTable('users').delete()
```

### 2. Use Type Casting for User Input

```javascript
// ✅ Good - ensures type safety
await db
  .fromTable('users')
  .where('id', '=', { value: req.params.id, type: 'number' })

// ⚠️ Risky - might cause type mismatch
await db
  .fromTable('users')
  .where('id', '=', req.params.id)
```

### 3. Use distinct() for Unique Values

```javascript
// ✅ Good - efficient database query
await db.fromTable('users').select().distinct('email')

// ⚠️ Less efficient - requires post-processing
const users = await db.fromTable('users').select('email')
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
await db
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
await db
  .fromTable('users')
  .delete()
  .where('last_login', '<', '2024-01-01')
  .andGroup((builder) => {
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
db.fromTable('users').select('*').where('id', '=', 1)

// Pattern 2: setTable → query method → conditions
db.setTable('users')
db.select('*').where('id', '=', 1)

// Pattern 3: Insert/Update/Delete first
db.fromTable('users').insert({...})
db.fromTable('users').update({...}).where('id', '=', 1)
db.fromTable('users').delete().where('id', '=', 1)

// Pattern 4: select() with distinct() ✨ NEW
db.fromTable('users').select().distinct('email')
db.fromTable('orders').select().distinct('customer_id', 'product_id')

// Pattern 5: whereField() with in()/notIn() ✨ NEW
db.fromTable('posts').select('*').whereField('author').in(['John', 'Jane'])
db.fromTable('users').select('*').whereField('status').notIn(['banned'])
```

### Invalid Patterns ❌

```javascript
// ❌ Cannot chain where() after where()
db.fromTable('users').select('*').where('id', '=', 1).where('status', '=', 'active')
// Use andWhere() or orWhere() instead

// ❌ Cannot use offset() without limit()
db.select('*').offset(20)

// ❌ fromTable() must be first
db.select('*').fromTable('users')

// ❌ Cannot end query with and()/or()
db.fromTable('users').select('*').where('id', '=', 1).and().done()

// ❌ distinct() requires columns
db.fromTable('users').select().distinct()

// ❌ distinct() requires select()
db.fromTable('users').distinct('email')

// ❌ in()/notIn() require whereField()
db.fromTable('users').select('*').in(['admin'])
```

---

## Complete Method Reference

| Method | Category | Description | New |
|--------|----------|-------------|-----|
| `new mySQLizer()` | Core | Constructor | |
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

---

## NPM Package

**Package Name:** `mysqlizer`  
**Current Version:** 1.0.0  
**Install:** `npm install mysqlizer`

### Package Links

- 📦 [NPM Package](https://www.npmjs.com/package/mysqlizer)
- 📖 [Full Documentation](https://github.com/yourusername/mysqlizer#readme)
- 🐛 [Report Issues](https://github.com/yourusername/mysqlizer/issues)
- 💬 [Discussions](https://github.com/yourusername/mysqlizer/discussions)

### Version History

- **v1.0.0** (2025) - Initial release
  - Fluent query builder API
  - SELECT DISTINCT support
  - Field-based IN/NOT IN operators
  - Immutable builder pattern
  - Automatic connection pool management
  - Promise-based interface

---

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**mySQLizer** - Simple, fluent MySQL query building for Node.js

<div align="center">
  <sub>Built with ❤️ for developers who love SQL</sub>
</div>