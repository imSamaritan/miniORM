# miniORM

A lightweight Object-Relational Mapping (ORM) library for Node.js with MySQL support and automatic connection pool management.

## Features

- **Immutable Builder Pattern**: Each query method returns a new instance, preserving immutability
- **Singleton Connection Pool**: Single shared pool across all miniORM instances with automatic cleanup
- **Flexible WHERE Conditions**: Support for multiple operators and type casting
- **Logical Operators**: Chain conditions with AND/OR operators and orWhere method
- **Auto Resource Management**: Pool automatically closes on process exit
- **Debug Support**: Built-in debugging with configurable namespaces
- **ES6 Module Support**: Full ESM compatibility

## Installation

```bash
npm install mysql2 debug @dotenvx/dotenvx express
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
  .and()
  .where('role', '=', 'admin')
  .done()

// Using orWhere for OR conditions
const privilegedUsers = await model
  .select('id', 'name', 'role')
  .where('role', '=', 'admin')
  .orWhere('role', '=', 'moderator')
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

#### `where(column, operator, value)`
Add WHERE condition to the query.

**Supported Operators:**
- `=`, `!=`, `<>`, `>`, `>=`, `<`, `<=`, `LIKE`, `NOT LIKE`

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
- Error if value object is missing required keys: "Value key is required and must carry a valid value!" or "Type key is required and must contain a string type as value"
- Error if value object contains invalid data: "Value can not be (null, undefined, {}, []) or empty!"

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

### Basic Queries

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

// Mixed conditions
const complexQuery = await model
  .select('*')
  .where('status', '=', 'active')
  .and()
  .where('age', '>=', 18)
  .orWhere('verified', '=', true)
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

### LIKE Patterns

```javascript
// Find users with names containing 'john'
const johns = await model
  .select('*')
  .where('name', 'LIKE', '%john%')
  .done()

// Find users with emails ending in '@gmail.com'
const gmailUsers = await model
  .select('*')
  .where('email', 'LIKE', '%@gmail.com')
  .done()

// Find users NOT like pattern
const nonGmailUsers = await model
  .select('*')
  .where('email', 'NOT LIKE', '%@gmail.com')
  .done()
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

app.get('/posts/:author', async (req, res) => {
  try {
    const { author } = req.params
    const model = new miniORM()
    model.setTable('posts')
    
    const posts = await model
      .select('post_id', 'post_title', 'post_body')
      .where('post_author', '=', author)
      .done()
      
    res.json(posts)
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
├── where()
├── orWhere()
├── and()
├── or()
└── clone()

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
├── auto-example.js        # Basic usage example with Express
├── usage-examples.js      # Advanced patterns (contains planned features)
├── index.js               # Production example
└── README.md              # This file
```

## Dependencies

- **mysql2**: MySQL client with promise support
- **debug**: Debug logging utility
- **@dotenvx/dotenvx**: Environment variable management
- **express**: Web framework (for examples)

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

// Extend with different conditions using orWhere
const adminOrModeratorUsers = await activeQuery
  .orWhere('role', '=', 'admin')
  .orWhere('role', '=', 'moderator')
  .done()

// Extend with AND conditions
const activeAdminUsers = await activeQuery
  .and()
  .where('role', '=', 'admin')
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
      query = query.and()
    }
    query = query.where('age', '>=', filters.minAge)
    hasConditions = true
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

## Working Example

Here's a complete working example based on the actual implementation:

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

// Get posts with complex conditions
app.get('/', async (req, res) => {
  try {
    const results = await postsModel
      .selectAll()
      .where('post_id', '>', 2)
      .orWhere('post_id', '<>', { value: 1, type: 'string' })
      .done()
    
    res.json(results)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get active users
app.get('/users', async (req, res) => {
  try {
    const results = await usersModel
      .select('id', 'name', 'email')
      .where('status', '=', 'active')
      .done()
    
    res.json(results)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Start server with automatic cleanup
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log('✨ Auto shutdown enabled - press Ctrl+C to gracefully stop!')
})

// Graceful shutdown (connection pool closes automatically)
process.on('SIGINT', () => {
  console.log('\n🛑 Received shutdown signal')
  server.close(() => {
    console.log('✅ Server closed')
    console.log('🔌 Connection pool will close automatically')
  })
})
```

## License

ISC