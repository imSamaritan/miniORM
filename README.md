# miniORM

A lightweight Object-Relational Mapping (ORM) library for Node.js with MySQL support and automatic connection pool management.

## Features

- **Immutable Builder Pattern**: Each query method returns a new instance, preserving immutability
- **Fluent Chainable API**: Readable methods like `model.fromTable('users').select('*')`
- **Promise-like Interface**: Await queries directly or call `.done()` explicitly
- **Singleton Connection Pool**: Single shared pool across all miniORM instances with automatic cleanup
- **Flexible WHERE Conditions**: Support for complex conditions with operators, IN/NOT IN, NULL checks, and BETWEEN ranges
- **Logical Operators**: Chain conditions with AND/OR operators, `orWhere()`, `andWhere()` methods, and grouping with `andGroup()`/`orGroup()`
- **Field-based Conditions**: Use `whereField()` for specialized operations like `isNull()`, `isBetween()`, etc.
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

// Insert a new user
const insertResult = await model
  .fromTable('users')
  .insert({
    name: 'John Doe',
    email: 'john@example.com',
    status: 'active'
  })

// Complex conditions with AND
const adminUsers = await model
  .fromTable('users')
  .select('id', 'name')
  .where('status', '=', 'active')
  .andWhere('role', '=', 'admin')

// Using grouped conditions
const complexUsers = await model
  .fromTable('users')
  .select('id', 'name', 'role')
  .where('status', '=', 'active')
  .andGroup((builder) => {
    return builder
      .where('role', '=', 'admin')
      .orWhere('role', '=', 'moderator')
  })

// Update records
const updateResult = await model
  .fromTable('users')
  .update({ status: 'inactive', updated_at: new Date() })
  .where('last_login', '<', '2024-01-01')
```

## API Reference

### Core Methods

#### `new miniORM(options?)`

Creates a new miniORM instance with optional database configuration.

**Parameters:**
- `options` (Object, optional): Database connection options
  - `host` (string): Database host (default: `process.env.DB_HOST` or `'localhost'`)
  - `user` (string): Database user (default: `process.env.DB_USER` or `'root'`)
  - `password` (string): Database password (default: `process.env.DB_PASSWORD`)
  - `database` (string): Database name (default: `process.env.DB_NAME`)
  - `port` (number): Database port (default: `process.env.DB_PORT` or `3306`)
  - `connectionLimit` (number): Max connections in pool (default: `process.env.CONNECTION_LIMIT` or `10`)

**Returns:** `miniORM` instance

**Examples:**

```javascript
// Use environment variables from .env
const model = new miniORM()

// Override with custom options
const model = new miniORM({
  host: 'custom-host',
  user: 'custom-user',
  password: 'custom-password',
  database: 'custom-db',
  connectionLimit: 20
})
```

---

#### `fromTable(tableName)`

Sets the table name for the query and returns a new instance. This is the preferred way to specify a table as it allows method chaining from the start.

**Parameters:**
- `tableName` (string): The name of the table

**Returns:** `miniORM` instance

**Examples:**

```javascript
const users = await model.fromTable('users').selectAll()

const posts = await model.fromTable('posts').select('id', 'title')
```

**Note:** `fromTable()` must be the first method in the chain. It cannot be called after other query building methods.

---

#### `setTable(tableName)`

Sets the table name for subsequent queries. Unlike `fromTable()`, this modifies the current instance.

**Parameters:**
- `tableName` (string): The name of the table

**Returns:** `void`

**Examples:**

```javascript
const model = new miniORM()
model.setTable('users')

const all = await model.selectAll()
const active = await model.select('id', 'name').where('status', '=', 'active')
```

---

#### `done()`

Executes the query and returns the results. This method is optional when awaiting the query builder directly, as miniORM implements a Promise-like interface.

**Returns:** `Promise<QueryResult>`

**Examples:**

```javascript
// Explicit .done()
const results = await model.fromTable('users').selectAll().done()

// Implicit (Promise-like)
const results = await model.fromTable('users').selectAll()
```

---

### Query Building Methods

#### `select(...columns)`

Selects specific columns from the table.

**Parameters:**
- `...columns` (string[]): One or more column names

**Returns:** `miniORM` instance

**Throws:** 
- Error if no columns provided
- Error if columns array contains empty, null, or undefined values

**Examples:**

```javascript
// Single column
const names = await model.fromTable('users').select('name')

// Multiple columns
const userInfo = await model.fromTable('users').select('id', 'name', 'email')
```

---

#### `selectAll()`

Selects all columns from the table (equivalent to `SELECT *`).

**Parameters:** None

**Returns:** `miniORM` instance

**Examples:**

```javascript
const allUsers = await model.fromTable('users').selectAll()
```

---

#### `countRecords()`

Counts the number of records in the table. Returns a result with `recordsCount` property.

**Parameters:** None

**Returns:** `miniORM` instance

**Examples:**

```javascript
const result = await model.fromTable('users').countRecords()
console.log(result[