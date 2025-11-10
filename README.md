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

// Using andWhere for AND conditions
const activeAdminUsers = await model
  .select('id', 'name', 'role')
  .where('status', '=', 'active')
  .andWhere('role', '=', 'admin')
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

// Using whereIn for multiple values
const privilegedUsersIn = await model
  .select('id', 'name', 'role')
  .whereIn('role', ['admin', 'moderator', 'supervisor'])
  .done()

// Using whereNotIn to exclude values
const activeUsersNotIn = await model
  .select('id', 'name', 'email')
  .whereNotIn('status', ['inactive', 'banned', 'deleted'])
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
- Error if trying to use IN/NOT IN operators: "For the current used operator IN, consider using corresponding method operator (whereIsNotNull(), whereIsNull(), whereIn(), whereNotIn(), whereBetween() and whereNotBetween()"
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

// Mixed conditions
const complexQuery = await model
  .select('*')
  .where('status', '=', 'active')
  .and()
  .where('age', '>=', 18)
  .orWhere('verified', '=', true)
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
  .orWhere('user_id', 'IN', [1, 5, 10])
  .done()

// Using IN with grouped conditions
const complexQuery = await model
  .select('*')
  .where('company', '=', 'TechCorp')
  .andGroup((builder) => {
    return builder
      .whereIn('role', ['admin', 'manager'])
      .orGroup((nestedBuilder) => {
        return nestedBuilder
          .whereNotIn('department', ['hr', 'finance'])
          .andWhere('level', '>=', 'senior')
      })
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

try {
  // This will throw - andWhere called incorrectly
  await model.select('*').and().andWhere('status', '=', 'active').done()
} catch (error) {
  console.error(error.message)
  // "andWhere method can not be called after and()/or() method operator!"
}

try {
  // This will throw - andWhere called before where
  await model.select('*').andWhere('status', '=', 'active').done()
} catch (error) {
  console.error(error.message)
  // "andWhere method must be chained after the where method!"
}

try {
  // This will throw - empty list for whereIn
  await model.select('*').whereIn('role', []).done()
} catch (error) {
  console.error(error.message)
  // "List should be an array type and not empty!"
}

try {
  // This will throw - invalid column for whereNotIn
  await model.select('*').whereNotIn('', ['admin', 'user']).done()
} catch (error) {
  console.error(error.message)
  // "Column should be string and not empty!"
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
├── andWhere()
├── whereIn()
├── whereNotIn()
├── and()
├── or()
├── orGroup()
├── andGroup()
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

// Extend with AND conditions using andWhere
const activeAdminUsers = await activeQuery
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
  
  // Example with grouped conditions
  if (filters.adminOrModerator && hasConditions) {
    query = query.andGroup((builder) => {
      return builder
        .where('role', '=', 'admin')
        .orWhere('role', '=', 'moderator')
    })
  }
  
  return await query.done()
}

const results = await getUsers({ status: 'active', minAge: 18, role: 'admin' })
```

## Real-World Examples

### E-commerce User Management

```javascript
import miniORM from './miniORM.js'

const usersModel = new miniORM()
usersModel.setTable('users')

// Find VIP customers: active users with high spending or premium membership
async function getVIPCustomers() {
  return await usersModel
    .select('id', 'name', 'email', 'membership_type', 'total_spent')
    .where('status', '=', 'active')
    .andGroup((builder) => {
      return builder
        .where('total_spent', '>', 1000)
        .orWhere('membership_type', '=', 'premium')
    })
    .done()
}

// Find customers needing attention: inactive OR (low spending AND no recent orders)
async function getCustomersNeedingAttention() {
  return await usersModel
    .select('id', 'name', 'email', 'last_login', 'total_spent')
    .where('status', '=', 'inactive')
    .orGroup((builder) => {
      return builder
        .where('total_spent', '<', 100)
        .andWhere('last_order_date', '<', '2024-01-01')
    })
    .done()
}
```

### Blog Content Management

```javascript
const postsModel = new miniORM()
postsModel.setTable('posts')

// Find featured content: published posts by staff OR highly rated posts
async function getFeaturedContent() {
  return await postsModel
    .select('id', 'title', 'author', 'rating', 'publish_date')
    .where('status', '=', 'published')
    .andGroup((builder) => {
      return builder
        .where('author_type', '=', 'staff')
        .orGroup((nestedBuilder) => {
          return nestedBuilder
            .where('rating', '>=', 4.5)
            .andWhere('view_count', '>', 1000)
        })
    })
    .done()
}

// Content moderation: find posts needing review
async function getPostsNeedingReview() {
  return await postsModel
    .select('id', 'title', 'author', 'created_at', 'report_count')
    .where('status', '=', 'pending')
    .orGroup((builder) => {
      return builder
        .where('report_count', '>', 3)
        .andWhere('status', '=', 'published')
    })
    .andWhere('reviewed', '=', false)
    .done()
}
```

### Employee Management System

```javascript
const employeesModel = new miniORM()
employeesModel.setTable('employees')

// Find employees eligible for promotion: senior level with good performance OR managers with leadership scores
async function getPromotionCandidates() {
  return await employeesModel
    .select('id', 'name', 'department', 'level', 'performance_score')
    .where('status', '=', 'active')
    .andGroup((builder) => {
      return builder
        .where('level', '=', 'senior')
        .andWhere('performance_score', '>=', 4.0)
    })
    .orGroup((builder) => {
      return builder
        .where('position', 'LIKE', '%manager%')
        .andWhere('leadership_score', '>=', 4.5)
    })
    .done()
}

// Find at-risk employees: poor performance OR attendance issues
async function getAtRiskEmployees() {
  return await employeesModel
    .select('id', 'name', 'department', 'performance_score', 'attendance_rate')
    .where('status', '=', 'active')
    .andGroup((builder) => {
      return builder
        .where('performance_score', '<', 2.5)
        .orWhere('attendance_rate', '<', 0.8)
        .orWhere('disciplinary_actions', '>', 2)
    })
    .done()
}
```

### Search and Filter API

```javascript
import express from 'express'

const app = express()
const productsModel = new miniORM()
productsModel.setTable('products')

// Advanced product search with multiple filters
app.get('/api/products/search', async (req, res) => {
  try {
    const { category, minPrice, maxPrice, inStock, featured, rating } = req.query
    
    let query = productsModel.select('id', 'name', 'price', 'category', 'stock', 'rating')
    let hasConditions = false
    
    // Category filter
    if (category) {
      query = query.where('category', '=', category)
      hasConditions = true
    }
    
    // Price range with grouped conditions
    if (minPrice || maxPrice) {
      if (hasConditions) {
        query = query.andGroup((builder) => {
          let priceQuery = builder
          if (minPrice) priceQuery = priceQuery.where('price', '>=', minPrice)
          if (maxPrice) {
            if (minPrice) priceQuery = priceQuery.andWhere('price', '<=', maxPrice)
            else priceQuery = priceQuery.where('price', '<=', maxPrice)
          }
          return priceQuery
        })
      } else {
        if (minPrice) query = query.where('price', '>=', minPrice)
        if (maxPrice) {
          if (minPrice) query = query.andWhere('price', '<=', maxPrice)
          else query = query.where('price', '<=', maxPrice)
        }
        hasConditions = true
      }
    }
    
    // Stock and featured status
    if (inStock === 'true' || featured === 'true') {
      const stockAndFeatured = (builder) => {
        let stockQuery = builder
        if (inStock === 'true') stockQuery = stockQuery.where('stock', '>', 0)
        if (featured === 'true') {
          if (inStock === 'true') stockQuery = stockQuery.andWhere('featured', '=', true)
          else stockQuery = stockQuery.where('featured', '=', true)
        }
        return stockQuery
      }
      
      if (hasConditions) {
        query = query.andGroup(stockAndFeatured)
      } else {
        query = stockAndFeatured(query)
        hasConditions = true
      }
    }
    
    // High rating filter
    if (rating) {
      if (hasConditions) {
        query = query.andWhere('rating', '>=', parseFloat(rating))
      } else {
        query = query.where('rating', '>=', parseFloat(rating))
      }
    }
    
    const results = await query.done()
    res.json(results)
    
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})
```

### Complete Working Example

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

// Complex query with grouping - find posts by specific authors OR high engagement
app.get('/', async (req, res) => {
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

// User search with multiple criteria
app.get('/users/advanced-search', async (req, res) => {
  try {
    const results = await usersModel
      .select('id', 'name', 'email', 'role', 'last_login')
      .where('status', '=', 'active')
      .andWhere('email_verified', '=', true)
      .andGroup((builder) => {
        return builder
          .where('role', '=', 'admin')
          .orWhere('role', '=', 'moderator')
          .orGroup((nestedBuilder) => {
            return nestedBuilder
              .where('role', '=', 'user')
              .andWhere('premium', '=', true)
          })
      })
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

## Method Chaining Rules and Best Practices

### Chaining Rules

Understanding the proper order of method chaining is crucial for building valid queries:

#### 1. Query Initialization
Always start with a table selection and column specification:
```javascript
// Required first steps
model.setTable('users')
const query = model.select('id', 'name') // or selectAll()
```

#### 2. WHERE Clause Initiation
The first condition must use `where()`:
```javascript
// ✅ Correct
query.where('status', '=', 'active')

// ❌ Wrong - will throw error
query.andWhere('status', '=', 'active') // Error: must be chained after where method
query.orWhere('status', '=', 'active')  // Error: must be chained after where method
```

#### 3. Subsequent Conditions
After the initial `where()`, use these methods:

**Direct chaining methods:**
- `andWhere()` - adds AND condition
- `orWhere()` - adds OR condition
- `andGroup()` - adds AND grouped conditions
- `orGroup()` - adds OR grouped conditions

**Operator methods (require additional where):**
- `and().where()` - adds AND operator + condition
- `or().where()` - adds OR operator + condition

#### 4. Invalid Chaining Patterns

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

### Best Practices

#### 1. Choose the Right Method

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

#### 2. Use Groups for Complex Logic

**Group related conditions:**
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

#### 3. Handle Dynamic Conditions

```javascript
function buildUserQuery(filters) {
  let query = model.select('*')
  let hasConditions = false
  
  // First condition must use where()
  if (filters.status) {
    query = query.where('status', '=', filters.status)
    hasConditions = true
  }
  
  // Subsequent conditions use andWhere/orWhere
  if (filters.role) {
    if (hasConditions) {
      query = query.andWhere('role', '=', filters.role)
    } else {
      query = query.where('role', '=', filters.role)
      hasConditions = true
    }
  }
  
  // Use groups for complex conditions
  if (filters.adminOrModerator && hasConditions) {
    query = query.andGroup((builder) => {
      return builder
        .where('role', '=', 'admin')
        .orWhere('role', '=', 'moderator')
    })
  }
  
  return query
}
```

#### 4. Debugging Complex Queries

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

#### 5. Error Prevention

**Always check your chaining order:**
1. Start with `select()` or `selectAll()`
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