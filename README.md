# miniORM

A lightweight Object-Relational Mapping (ORM) library for Node.js with MySQL support and automatic connection pool management.

## Features

- **Immutable Builder Pattern**: Each query method returns a new instance, preserving immutability
- **Singleton Connection Pool**: Single shared pool across all miniORM instances with automatic cleanup
- **Flexible WHERE Conditions**: Support for multiple operators including IN/NOT IN and type casting
- **Logical Operators**: Chain conditions with AND/OR operators, orWhere, andWhere methods, and grouping with andGroup/orGroup
- **Auto Resource Management**: Pool automatically closes on process exit
- **Debug Support**: Built-in debugging with configurable namespaces
- **ES6 Module Support**: Full ESM compatibility
- **UPDATE Operations**: Support for UPDATE queries with WHERE conditions

## Installation

```bash
npm install mysql2 debug @dotenvx/dotenvx
```

## Environment Setup

Create a `.env` file with your database configuration:

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
model.setTable('users')

// Select all users
const allUsers = await model.selectAll().done()

// Select specific columns with WHERE condition
const activeUsers = await model
  .select('id', 'name', 'email')
  .where('status', '=', 'active')
  .done()

// Complex conditions with AND/OR
const adminUsers = await model
  .select('id', 'name')
  .where('status', '=', 'active')
  .andWhere('role', '=', 'admin')
  .done()

// Using orWhere for OR conditions
const privilegedUsers = await model
  .select('id', 'name', 'role')
  .where('role', '=', 'admin')
  .orWhere('role', '=', 'moderator')
  .done()

// Using grouped conditions
const complexUsers = await model
  .select('id', 'name', 'role')
  .where('status', '=', 'active')
  .andGroup((builder) => {
    return builder
      .where('role', '=', 'admin')
      .orWhere('role', '=', 'moderator')
  })
  .done()

// Update records
const updateResult = await model
  .update({ status: 'inactive', updated_at: new Date() })
  .where('last_login', '<', '2024-01-01')
  .done()
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
  database: 'custom-db',
  connectionLimit: 20
})
```

#### `setTable(tableName)`
Set the table name for queries.

```javascript
model.setTable('users')
```

#### `done()`
Execute the built query and return results.

```javascript
const results = await model.select('*').done()
```

### Query Building Methods

#### `select(...columns)`
Select specific columns. Validates that columns are not empty, null, or undefined.

```javascript
model.select('id', 'name', 'email')
model.select('*') // Select all columns
```

**Throws:**
- Error if no columns provided: "Column or columns, required!"
- Error if columns contain empty, null, or undefined values: "List of columns can't include [empty, null or undefined] column(s) name(s)!"

#### `selectAll()`
Select all columns (equivalent to `select('*')`). Takes no arguments.

```javascript
model.selectAll()
```

**Throws:**
- Error if any arguments are provided: "selectAll method takes none or 0 arguments!"

#### `update(details)`
Create an UPDATE query with the provided column-value pairs.

```javascript
model.update({ 
  status: 'active', 
  updated_at: new Date(),
  view_count: 100 
})
```

**Throws:**
- Error if details is null or undefined: "Update method argument can not be null or undefined!"
- Error if details is not an object or is an array: "Update method must take in a none empty object type e.g {column: value, ...}!"
- Error if details is an empty object: "Update method requires none empty object as its argument!"
- Error if chained after another query method: "Update method can not be chained after another query builder method!"

#### `where(column, operator, value)`
Add WHERE condition to the query.

**Supported Operators:**
- `=`, `!=`, `<>`, `>`, `>=`, `<`, `<=`, `LIKE`, `NOT LIKE`

**Note:** For `IN` and `NOT IN` operations, use the dedicated methods `whereIn()` and `whereNotIn()` instead.

**Value Types:**
- **Primitive values** (string, number, boolean):
```javascript
model.where('age', '>', 18)
model.where('name', 'LIKE', '%john%')
model.where('active', '=', true)
```

- **Object with type casting**:
```javascript
model.where('age', '>', { value: '25', type: 'number' })
model.where('score', '=', { value: 'true', type: 'boolean' })
model.where('name', '=', { value: 123, type: 'string' })
```

**Throws:**
- Error if not exactly 3 arguments: "Where method takes 3 arguments (column,operator,value)!"
- Error if column is not a string or is empty: "Column should be string type and not be empty"
- Error if operator is not supported: "Supported operators (=,!=,<>,>,>=,<,<=,LIKE,NOT LIKE)"
- Error if trying to use IN/NOT IN/NULL operators: "For the current used operator IN, consider using corresponding method operator (whereIsNotNull(), whereIsNull(), whereIn(), whereNotIn())"
- Error if chained after another where(): "Where method can not be chain after another one, consider using the following methods after where (or(), and(), orWhere(), andWhere(), orGroup(cb), andGroup(cb))"

#### `orWhere(column, operator, value)`
Add OR WHERE condition to the query. Must be chained after an initial `where()` call.

```javascript
model
  .select('*')
  .where('role', '=', 'admin')
  .orWhere('role', '=', 'moderator')
```

**Throws:**
- Error if called after and()/or(): "orWhere method can not be called after and()/or() method operator!"
- Error if called before where(): "orWhere method must be chained after the where method!"

#### `andWhere(column, operator, value)`
Add AND WHERE condition to the query. Must be chained after an initial `where()` call.

```javascript
model
  .select('*')
  .where('status', '=', 'active')
  .andWhere('role', '=', 'admin')
```

**Throws:**
- Error if called after and()/or(): "andWhere method can not be called after and()/or() method operator!"
- Error if called before where(): "andWhere method must be chained after the where method!"

#### `whereIn(column, list)`
Add WHERE IN condition to check if column value exists in the provided list.

```javascript
model
  .select('*')
  .whereIn('role', ['admin', 'moderator', 'manager'])
```

This generates: `WHERE role IN (?, ?, ?)`

**Throws:**
- Error if column is not a string or is empty: "Column should be string and not empty!"
- Error if list is not an array or is empty: "List should be an array type and not empty!"

#### `whereNotIn(column, list)`
Add WHERE NOT IN condition to check if column value does not exist in the provided list.

```javascript
model
  .select('*')
  .whereNotIn('status', ['inactive', 'banned', 'deleted'])
```

This generates: `WHERE status NOT IN (?, ?, ?)`

**Throws:**
- Error if column is not a string or is empty: "Column should be string and not empty!"
- Error if list is not an array or is empty: "List should be an array type and not empty!"

#### `whereIsNull(column)`
Add WHERE IS NULL condition to check if column value is NULL.

```javascript
model
  .select('*')
  .whereIsNull('deleted_at')
```

This generates: `WHERE deleted_at IS NULL`

**Chaining:**
- Can be used as the first WHERE condition
- When chaining after another WHERE condition, must use `and()`, `or()`, `andWhere()`, `orWhere()`, or grouping methods (`andGroup()`, `orGroup()`)

**Throws:**
- Error if not exactly 1 argument: "'Column name' argument is the only one that is required!"
- Error if column is not a string or is empty: "Column should be a string and not empty!"
- Error if chained directly after `where()`: "where() and whereIsNull() methods must be chained through and() or or() or use grouping methods!"

#### `whereIsNotNull(column)`
Add WHERE IS NOT NULL condition to check if column value is not NULL.

```javascript
model
  .select('*')
  .whereIsNotNull('email')
```

This generates: `WHERE email IS NOT NULL`

**Chaining:**
- Can be used as the first WHERE condition
- When chaining after another WHERE condition, must use `and()`, `or()`, `andWhere()`, `orWhere()`, or grouping methods (`andGroup()`, `orGroup()`)

**Throws:**
- Error if not exactly 1 argument: "'Column name' argument is the only one that is required!"
- Error if column is not a string or is empty: "Column should be a string and not empty!"
- Error if chained directly after `where()`: "where() and whereIsNull() methods must be chained through and() or or() or use grouping methods!"

#### `orGroup(callback)`
Group WHERE conditions with OR logic. Takes a callback function that receives a builder instance.

```javascript
model
  .select('*')
  .where('status', '=', 'active')
  .orGroup((builder) => {
    return builder
      .where('role', '=', 'admin')
      .andWhere('department', '=', 'IT')
  })
```

This generates: `WHERE status = ? OR (role = ? AND department = ?)`

#### `andGroup(callback)`
Group WHERE conditions with AND logic. Takes a callback function that receives a builder instance.

```javascript
model
  .select('*')
  .where('status', '=', 'active')
  .andGroup((builder) => {
    return builder
      .where('role', '=', 'admin')
      .orWhere('role', '=', 'moderator')
  })
```

This generates: `WHERE status = ? AND (role = ? OR role = ?)`

#### `and()`
Add AND operator between conditions.

```javascript
model
  .select('*')
  .where('status', '=', 'active')
  .and()
  .where('role', '=', 'admin')
```

#### `or()`
Add OR operator between conditions.

```javascript
model
  .select('*')
  .where('role', '=', 'admin')
  .or()
  .where('role', '=', 'moderator')
```

### Properties

#### `state` (read-only)
Get current query state.

```javascript
console.log(model.state)
// { query: ['SELECT * FROM users WHERE status = ?'], values: ['active'] }
```

#### `table` (read-only)
Get current table name.

```javascript
console.log(model.table) // 'users'
```

#### `operatorSignal` (read-only)
Check if current instance is an operator (AND/OR).

```javascript
console.log(model.and().operatorSignal) // true
console.log(model.select('id').operatorSignal) // false
```

## Examples

### Basic SELECT Queries

```javascript
import miniORM from './miniORM.js'

const model = new miniORM()
model.setTable('users')

// Select all users
const allUsers = await model.selectAll().done()

// Select specific columns
const userInfo = await model
  .select('id', 'name', 'created_at')
  .done()

// Simple WHERE condition
const activeUsers = await model
  .select('id', 'name')
  .where('status', '=', 'active')
  .done()

// WHERE IN condition
const privilegedUsers = await model
  .select('id', 'name', 'role')
  .whereIn('role', ['admin', 'moderator', 'manager'])
  .done()
```

### Complex Conditions

```javascript
// AND condition
const adminUsers = await model
  .select('id', 'name', 'role')
  .where('status', '=', 'active')
  .and()
  .where('role', '=', 'admin')
  .done()

// OR condition using or() method
const privilegedUsers1 = await model
  .select('id', 'name', 'role')
  .where('role', '=', 'admin')
  .or()
  .where('role', '=', 'moderator')
  .done()

// OR condition using orWhere() method
const privilegedUsers2 = await model
  .select('id', 'name', 'role')
  .where('role', '=', 'admin')
  .orWhere('role', '=', 'moderator')
  .done()

// AND condition using andWhere() method
const activeAdmins = await model
  .select('id', 'name', 'role')
  .where('status', '=', 'active')
  .andWhere('role', '=', 'admin')
  .done()
```

### WHERE IN/NOT IN Queries

```javascript
// Select users with specific roles
const privilegedUsers = await model
  .select('*')
  .whereIn('role', ['admin', 'moderator', 'supervisor'])
  .done()

// Select users excluding certain statuses
const activeUsers = await model
  .select('*')
  .whereNotIn('status', ['inactive', 'banned', 'deleted'])
  .done()

// Combine IN with other conditions
const specificUsers = await model
  .select('*')
  .where('department', '=', 'engineering')
  .andWhere('status', '=', 'active')
  .done()
```

### NULL Checking Queries

```javascript
// Find users with no deletion timestamp (active users)
const activeUsers = await model
  .select('*')
  .whereIsNull('deleted_at')
  .done()

// Find users with verified email addresses
const verifiedUsers = await model
  .select('*')
  .whereIsNotNull('email_verified_at')
  .done()

// Combine NULL checks with other conditions using and()
const incompleteProfiles = await model
  .select('id', 'name', 'email')
  .where('status', '=', 'active')
  .and()
  .whereIsNull('phone')
  .done()
```

### UPDATE Queries

```javascript
// Update single record
const updateResult = await model
  .update({ status: 'inactive', updated_at: new Date() })
  .where('user_id', '=', 123)
  .done()

// Update multiple records with WHERE condition
const bulkUpdate = await model
  .update({ 
    status: 'verified',
    verification_date: new Date(),
    points: 100
  })
  .where('email_verified', '=', true)
  .andWhere('status', '=', 'pending')
  .done()

// Update with complex conditions
const complexUpdate = await model
  .update({ last_activity: new Date() })
  .where('status', '=', 'active')
  .andGroup((builder) => {
    return builder
      .where('role', '=', 'admin')
      .orWhere('last_login', '>', '2024-01-01')
  })
  .done()
```

### Type Casting

```javascript
// Cast string to number
const adults = await model
  .select('*')
  .where('age', '>', { value: '18', type: 'number' })
  .done()

// Cast to boolean
const verifiedUsers = await model
  .select('*')
  .where('verified', '=', { value: 'true', type: 'boolean' })
  .done()

// Cast number to string
const userById = await model
  .select('*')
  .where('user_id', '=', { value: 123, type: 'string' })
  .done()
```

### Grouped Conditions

```javascript
// Group conditions with AND logic
const seniorDevelopers = await model
  .select('*')
  .where('status', '=', 'active')
  .andGroup((builder) => {
    return builder
      .where('role', '=', 'developer')
      .andWhere('experience', '>', 5)
  })
  .done()

// Group conditions with OR logic  
const privilegedUsers = await model
  .select('*')
  .where('status', '=', 'active')
  .andGroup((builder) => {
    return builder
      .where('role', '=', 'admin')
      .orWhere('role', '=', 'moderator')
  })
  .done()

// Complex nested grouping
const complexQuery = await model
  .select('*')
  .where('company', '=', 'TechCorp')
  .andGroup((builder) => {
    return builder
      .where('department', '=', 'engineering')
      .orGroup((nestedBuilder) => {
        return nestedBuilder
          .where('role', '=', 'manager')
          .andWhere('level', '>=', 'senior')
      })
  })
  .done()

// This generates SQL like:
// WHERE company = ? AND (department = ? OR (role = ? AND level >= ?))
```

## Express Integration

```javascript
import express from 'express'
import miniORM from './miniORM.js'

const app = express()

app.get('/users', async (req, res) => {
  try {
    const model = new miniORM()
    model.setTable('users')
    
    const users = await model
      .select('id', 'name', 'email')
      .where('status', '=', 'active')
      .done()
      
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.put('/users/:id/activate', async (req, res) => {
  try {
    const { id } = req.params
    const model = new miniORM()
    model.setTable('users')
    
    const result = await model
      .update({ 
        status: 'active',
        activated_at: new Date()
      })
      .where('id', '=', id)
      .done()
      
    res.json({ success: true, affected: result.affectedRows })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.listen(3000)
```

## Error Handling

### Query Validation Errors

```javascript
try {
  // This will throw - empty column name
  await model.select('', 'name').done()
} catch (error) {
  console.error(error.message)
  // "List of columns can't include [empty, null or undefined] column(s) name(s)!"
}

try {
  // This will throw - query ends with operator
  await model.select('*').where('status', '=', 'active').and().done()
} catch (error) {
  console.error(error.message)
  // "SQL query can not end with a logical operator [AND]"
}

try {
  // This will throw - orWhere called incorrectly
  await model.select('*').and().orWhere('status', '=', 'active').done()
} catch (error) {
  console.error(error.message)
  // "orWhere method can not be called after and()/or() method operator!"
}
```

### WHERE Condition Errors

```javascript
try {
  // This will throw - unsupported operator
  await model.where('age', 'BETWEEN', 18).done()
} catch (error) {
  console.error(error.message)
  // "Supported operators (=,!=,<>,>,>=,<,<=,LIKE,NOT LIKE)"
}

try {
  // This will throw - invalid type casting
  await model.where('age', '>', { value: 'abc', type: 'number' }).done()
} catch (error) {
  console.error(error.message)
  // "Cannot cast 'abc' to number"
}
```

### UPDATE Errors

```javascript
try {
  // This will throw - empty update object
  await model.update({}).where('id', '=', 1).done()
} catch (error) {
  console.error(error.message)
  // "Update method requires none empty object as its argument!"
}

try {
  // This will throw - chaining update after select
  await model.select('*').update({ name: 'test' }).done()
} catch (error) {
  console.error(error.message)
  // "Update method can not be chained after another query builder method!"
}
```

## Debug Mode

Enable debug logging to monitor ORM operations:

```bash
# Enable all miniORM debug output
DEBUG=miniORM:* node your-app.js

# Enable only query debugging
DEBUG=miniORM:query node your-app.js

# Enable only database connection debugging
DEBUG=miniORM:db node your-app.js

# Enable only configuration debugging
DEBUG=miniORM:options node your-app.js
```

Debug output includes:
- SQL queries and parameter values
- Database connection events
- Configuration options
- Pool creation and cleanup

## Connection Management

miniORM uses a singleton connection pool that is automatically managed:

### Automatic Features

1. **Pool Creation**: First database query creates the connection pool
2. **Pool Reuse**: All miniORM instances share the same pool
3. **Auto Cleanup**: Pool closes automatically on process termination
4. **Signal Handlers**: Registered for SIGINT, SIGTERM, and exit events

### Configuration Priority

1. Constructor options (highest priority)
2. Environment variables
3. Default values (lowest priority)

```javascript
// Environment variables take precedence
process.env.DB_HOST = 'env-host'

const model = new miniORM({
  host: 'option-host'  // This will be used instead of env-host
})
```

## Architecture

### Class Hierarchy

```
Builder (Base Class)
├── select()
├── selectAll()  
├── update()
├── where()
├── orWhere()
├── andWhere()
├── whereIn()
├── whereNotIn()
├── whereIsNull()
├── whereIsNotNull()
├── and()
├── or()
├── orGroup()
├── andGroup()
└── [_clone]()

miniORM (Extended Class)
├── constructor()
├── setTable()
├── done()
├── state (getter)
├── table (getter)
└── operatorSignal (getter)
```

### Immutable Pattern

Each method returns a new instance, preserving the original:

```javascript
const base = new miniORM()
base.setTable('users')

const query1 = base.select('id', 'name')       // New instance
const query2 = query1.where('status', '=', 'active')  // New instance
const query3 = query2.orWhere('role', '=', 'admin')   // New instance

// Original base instance remains unchanged
console.log(base.state) // { query: [], values: [] }
console.log(query3.state) // { query: [...], values: [...] }
```

## Type Casting

The Helper class provides automatic type conversion:

### Supported Types

- **string**: Converts any value to string using `toString()`
- **number**: Converts to number, throws error if invalid
- **boolean**: Converts to boolean using `Boolean()`
- **default**: Returns value as-is

### Usage Examples

```javascript
// These are equivalent:
model.where('age', '>', 25)
model.where('age', '>', { value: 25, type: 'number' })

// Type casting in action:
model.where('score', '=', { value: '95.5', type: 'number' }) // Converts '95.5' to 95.5
model.where('active', '=', { value: 'yes', type: 'boolean' }) // Converts 'yes' to true
model.where('user_id', '=', { value: 123, type: 'string' }) // Converts 123 to '123'
```

## Method Chaining Rules

Understanding the proper order of method chaining is crucial for building valid queries:

### 1. Query Initialization
Always start with a table selection and column specification:
```javascript
// Required first steps
model.setTable('users')
const query = model.select('id', 'name') // or selectAll() or update({...})
```

### 2. WHERE Clause Initiation
The first condition must use `where()`:
```javascript
// ✅ Correct
query.where('status', '=', 'active')

// ❌ Wrong - will throw error
query.andWhere('status', '=', 'active') // Error: must be chained after where method
query.orWhere('status', '=', 'active')  // Error: must be chained after where method
```

### 3. Subsequent Conditions
After the initial `where()`, use these methods:

**Direct chaining methods:**
- `andWhere()` - adds AND condition
- `orWhere()` - adds OR condition
- `andGroup()` - adds AND grouped conditions
- `orGroup()` - adds OR grouped conditions

**Operator methods (require additional where):**
- `and().where()` - adds AND operator + condition
- `or().where()` - adds OR operator + condition

### 4. Invalid Chaining Patterns

```javascript
// ❌ Wrong - operator methods can't be followed by *Where methods
query
  .where('status', '=', 'active')
  .and()
  .andWhere('role', '=', 'admin') // Error!

// ❌ Wrong - query cannot end with operators
query
  .where('status', '=', 'active')
  .and() // Error: query cannot end with logical operator

// ❌ Wrong - where cannot be chained after where
query
  .where('status', '=', 'active')
  .where('role', '=', 'admin') // Error: use andWhere/orWhere instead
```

## Project Structure

```
miniORM/
├── miniORM.js              # Main ORM class
├── builder/
│   └── Builder.js          # Query builder base class
├── execute/
│   └── Execute.js          # Query execution with mysql2
├── db/
│   └── db.js              # Connection pool singleton
├── helper/
│   └── Helper.js          # Type casting utilities
├── examples/
│   ├── auto-closing-demo.js    # Connection cleanup demo
│   └── test-auto-closing.js    # Auto-cleanup tests
├── auto-example.js        # Basic usage example
├── example-app.js         # Express integration example
├── index.js               # Demo server
└── README.md              # This file
```

## Dependencies

- **mysql2**: MySQL client with promise support
- **debug**: Debug logging utility
- **@dotenvx/dotenvx**: Environment variable management

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_HOST` | `localhost` | Database host |
| `DB_USER` | `root` | Database username |
| `DB_PASSWORD` | `(required)` | Database password |
| `DB_NAME` | `(required)` | Database name |
| `DB_PORT` | `3306` | Database port |
| `CONNECTION_LIMIT` | `10` | Max pool connections |

## Common Patterns

### Multiple Tables

```javascript
const usersModel = new miniORM()
usersModel.setTable('users')

const postsModel = new miniORM()
postsModel.setTable('posts')

// Both share the same connection pool
const users = await usersModel.selectAll().done()
const posts = await postsModel.selectAll().done()
```

### Reusable Queries

```javascript
const activeUsersBase = new miniORM()
activeUsersBase.setTable('users')

// Create reusable base query
const activeQuery = activeUsersBase
  .select('id', 'name', 'email')
  .where('status', '=', 'active')

// Extend with different conditions
const adminUsers = await activeQuery
  .andWhere('role', '=', 'admin')
  .done()

// Extend with grouped conditions
const complexUsers = await activeQuery
  .andGroup((builder) => {
    return builder
      .where('role', '=', 'admin')
      .orWhere('role', '=', 'moderator')
  })
  .done()
```

### Dynamic Conditions

```javascript
async function getUsers(filters) {
  let query = new miniORM()
  query.setTable('users')
  query = query.selectAll()
  
  let hasConditions = false
  
  if (filters.status) {
    query = query.where('status', '=', filters.status)
    hasConditions = true
  }
  
  if (filters.minAge) {
    if (hasConditions) {
      query = query.andWhere('age', '>=', filters.minAge)
    } else {
      query = query.where('age', '>=', filters.minAge)
      hasConditions = true
    }
  }
  
  if (filters.role && hasConditions) {
    query = query.orWhere('role', '=', filters.role)
  } else if (filters.role) {
    query = query.where('role', '=', filters.role)
  }
  
  return await query.done()
}

const results = await getUsers({ status: 'active', minAge: 18, role: 'admin' })
```

## Complete Working Example

```javascript
import express from 'express'
import dotenv from '@dotenvx/dotenvx'
import miniORM from './miniORM.js'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Create model instances
const postsModel = new miniORM()
const usersModel = new miniORM()

postsModel.setTable('posts')
usersModel.setTable('users')

// Complex query with grouping
app.get('/featured-posts', async (req, res) => {
  try {
    const results = await postsModel
      .select('id', 'title', 'author', 'views', 'likes')
      .where('status', '=', 'published')
      .andGroup((builder) => {
        return builder
          .where('author', '=', 'admin')
          .orWhere('author', '=', 'editor')
      })
      .orGroup((builder) => {
        return builder
          .where('views', '>', 1000)
          .andWhere('likes', '>', 50)
      })
      .done()
    
    res.json(results)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// User update endpoint
app.put('/users/:id/promote', async (req, res) => {
  try {
    const { id } = req.params
    const result = await usersModel
      .update({ 
        role: 'admin',
        promoted_at: new Date(),
        updated_by: 'system'
      })
      .where('id', '=', id)
      .andWhere('status', '=', 'active')
      .done()
    
    res.json({ success: true, affected: result.affectedRows })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log('✨ Auto shutdown enabled - press Ctrl+C to gracefully stop!')
})
```

## Best Practices

### 1. Choose the Right Method

**Use `andWhere/orWhere` for simple conditions:**
```javascript
// Preferred - cleaner and more readable
const result = await model
  .select('*')
  .where('status', '=', 'active')
  .andWhere('role', '=', 'admin')
  .orWhere('role', '=', 'moderator')
  .done()
```

**Use `and()/or()` when you need explicit control:**
```javascript
// When you need specific operator placement
const result = await model
  .select('*')
  .where('status', '=', 'active')
  .and()
  .where('role', '=', 'admin')
  .done()
```

### 2. Use Groups for Complex Logic

```javascript
// Find users: active AND (admin OR moderator with high rating)
const result = await model
  .select('*')
  .where('status', '=', 'active')
  .andGroup((builder) => {
    return builder
      .where('role', '=', 'admin')
      .orGroup((nested) => {
        return nested
          .where('role', '=', 'moderator')
          .andWhere('rating', '>', 4.5)
      })
  })
  .done()
```

### 3. Debugging Complex Queries

Use the `state` property to inspect your query:

```javascript
const query = model
  .select('*')
  .where('status', '=', 'active')
  .andGroup((builder) => {
    return builder
      .where('role', '=', 'admin')
      .orWhere('department', '=', 'IT')
  })

console.log('Query parts:', query.state.query)
console.log('Values:', query.state.values)
// Query parts: ['SELECT * FROM users', 'WHERE status = ?', 'AND', '(', 'role = ?', 'OR', 'department = ?', ')']
// Values: ['active', 'admin', 'IT']
```

### 4. Error Prevention

**Always check your chaining order:**
1. Start with `select()`, `selectAll()`, or `update()`
2. First condition with `where()`
3. Additional conditions with `andWhere()`, `orWhere()`, or groups
4. End with `done()`

**Common error patterns to avoid:**
```javascript
// ❌ Don't do this
model.andWhere('status', '=', 'active') // Missing initial where()
model.where('x', '=', 1).where('y', '=', 2) // Chaining where() methods
model.where('x', '=', 1).and() // Ending with operator
```

## License

ISC
