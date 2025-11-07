# miniORM

A lightweight Object-Relational Mapping (ORM) library for Node.js with MySQL support and automatic connection pool management.

## Architecture

miniORM follows a clean class-based inheritance pattern with automatic resource management:

- **Builder (Base Class)**: Core query building methods (`select()`, `selectAll()`, `and()`, `or()`)
- **miniORM (Extended Class)**: Main ORM functionality including connection management, state handling, and execution
- **Execute Module**: Handles SQL query execution using mysql2 promise interface
- **DB Module**: Manages singleton connection pool with automatic cleanup on process termination

## Key Features

- **Immutable Builder Pattern**: Each query method returns a new instance, preserving immutability
- **Singleton Connection Pool**: Single shared pool across all miniORM instances with promise-based initialization
- **Automatic Cleanup**: Pool automatically closes on process exit (SIGINT, SIGTERM, exit events)
- **Debug Support**: Built-in debugging with configurable namespaces using the `debug` library
- **ES6 Module Support**: Full ESM compatibility with modern Node.js

## Installation

```bash
npm install
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

## Current Implementation Status

### ✅ Implemented Features

- Core ORM class with Builder inheritance
- Connection pool management with auto-cleanup
- Query building: `select()`, `selectAll()`, `and()`, `or()`
- Immutable state management
- Debug logging support
- Automatic resource cleanup

### ❌ Missing Features (Documented but not implemented)

- `where()` method - referenced in tests but not implemented in Builder class
- Graceful shutdown methods (`setupGracefulShutdown()`, `gracefulShutdown()`)
- Multiple execution methods beyond `all()`

## Usage

### Basic Usage

```javascript
import miniORM from './miniORM.js'

// Create instance and set table
const model = new miniORM()
model.setTable('users')

// Build and execute queries (Note: where() method not yet implemented)
const users = await model
  .select('id', 'name', 'email')
  .done()
```

### Connection Pool Management

Connection pools are handled automatically with singleton pattern:

```javascript
// Multiple instances share the same connection pool
const postsModel = new miniORM()
const usersModel = new miniORM()

postsModel.setTable('posts')
usersModel.setTable('users')

// Both instances use the same underlying connection pool
// No manual connection management required
```

## API Reference

### Core Methods

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

#### `selectAll()`
Select all columns (equivalent to `select('*')`). Takes no arguments.

```javascript
model.selectAll()
```

#### `and()`
Add AND operator between conditions. Returns new instance marked as operator.

```javascript
model
  .select('*')
  // .where({ status: 'active' })  // Not yet implemented
  .and()
  // .where({ role: 'admin' })     // Not yet implemented
```

#### `or()`
Add OR operator between conditions. Returns new instance marked as operator.

```javascript
model
  .select('*')
  // .where({ role: 'admin' })     // Not yet implemented
  .or()
  // .where({ role: 'moderator' }) // Not yet implemented
```

### Properties

#### `state`
Get current query state (read-only).

```javascript
console.log(model.state) // { query: [...], values: [...] }
```

#### `table`
Get current table name.

```javascript
console.log(model.table) // 'users'
```

#### `operatorSignal`
Check if current instance is an operator (AND/OR).

```javascript
console.log(model.and().operatorSignal) // true
```

## Examples

### Basic Select Query

```javascript
const model = new miniORM()
model.setTable('users')

const allUsers = await model
  .selectAll()
  .done()

const specificColumns = await model
  .select('id', 'name', 'created_at')
  .done()
```

### Query Building with Operators

```javascript
// Note: This example shows intended usage, but where() method is not implemented yet
const model = new miniORM()
model.setTable('users')

// This would work once where() method is implemented:
// const query = model
//   .select('id', 'name')
//   .where({ status: 'active' })
//   .and()
//   .where({ role: 'admin' })

// Currently available:
const query = model
  .select('id', 'name')
  .and() // Creates operator state
  
console.log(query.state) // Shows query structure
```

## Error Handling

The ORM includes built-in validation:

- Empty, null, or undefined column names are rejected in `select()`
- `selectAll()` method validates that no arguments are passed
- Queries ending with logical operators (AND/OR) throw errors on execution
- Missing database configuration throws descriptive errors

```javascript
try {
  // This will throw - query ends with AND operator
  const badQuery = model.select('id').and()
  await badQuery.done()
} catch (error) {
  console.error('Query failed:', error.message)
  // "SQL query can not end with a logical operator [AND]"
}
```

## Debug Mode

Enable debug logging to monitor ORM operations:

```bash
DEBUG=miniORM:* node your-app.js
```

Available debug namespaces:
- `miniORM:query` - SQL queries and parameters  
- `miniORM:db` - Database connection events
- `miniORM:options` - Configuration options

## Automatic Connection Management

miniORM automatically handles database connections with zero configuration:

```javascript
import express from 'express'
import miniORM from './miniORM.js'

const app = express()

app.get('/users', async (req, res) => {
  const model = new miniORM()
  model.setTable('users')
  
  try {
    const users = await model.selectAll().done()
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.listen(3000)
// Connection pool automatically closes when process terminates
```

### Automatic Lifecycle Management

1. **Pool Creation**: First database query creates singleton connection pool
2. **Pool Reuse**: All miniORM instances share the same pool via promise-based singleton
3. **Cleanup Registration**: Process exit handlers registered automatically on first pool creation
4. **Graceful Shutdown**: Pool closes on SIGINT, SIGTERM, or normal exit events

## Project Structure

```
miniORM/
├── miniORM.js              # Main ORM class (extends Builder)
├── builder/
│   └── Builder.js          # Query builder base class
├── execute/
│   └── Execute.js          # Query execution with mysql2
├── db/
│   └── db.js              # Connection pool singleton with auto-cleanup
├── examples/
│   ├── auto-closing-demo.js    # Demonstrates auto-cleanup behavior
│   └── test-auto-closing.js    # Test suite for auto-cleanup
├── index.js               # Production example application
├── auto-example.js        # Basic usage example
└── usage-examples.js      # Advanced usage patterns (references unimplemented features)
```

## Implementation Details

### Immutable Builder Pattern

Each query method creates a new instance using the `clone()` method:

```javascript
// Each method returns a new miniORM instance
const query1 = model.select('id', 'name')      // New instance
const query2 = query1.and()                   // New instance  
const query3 = query2.selectAll()             // New instance

// Original model remains unchanged
console.log(model.state)  // { query: [], values: [] }
console.log(query3.state) // { query: [...], values: [...] }
```

### Singleton Connection Pool with Promise Lock

The database module prevents race conditions using promise-based singleton:

```javascript
// Multiple concurrent instantiations share the same pool creation promise
const [model1, model2] = await Promise.all([
  new miniORM(),
  new miniORM()
])

// Both use the same poolPromise, preventing duplicate connections
```

### Clone Method Implementation

The `clone()` method preserves instance configuration while creating new state:

```javascript
clone(state, isOperator = this.#isOperator, executeMethod = this.#executeMethod) {
  const instance = new this.constructor(this.#options, state, isOperator, executeMethod)
  instance.setTable(this.#table)
  instance.#execute = this.#execute
  return instance
}
```

## Running Examples

### Auto-Cleanup Demonstration
```bash
node examples/auto-closing-demo.js
```

### Auto-Cleanup Test Suite  
```bash
node examples/test-auto-closing.js
```

### Basic Usage Example
```bash
node auto-example.js
```

### Production Example
```bash
node index.js
```

Note: Some examples reference unimplemented features and may not work as shown.

## Configuration

### Environment Variables
```env
DB_HOST=localhost
DB_USER=root  
DB_PASSWORD=your_password
DB_NAME=your_database
DB_PORT=3306
CONNECTION_LIMIT=10
```

### Constructor Options
```javascript
const model = new miniORM({
  host: 'custom-host',
  user: 'custom-user', 
  password: 'custom-password',
  database: 'custom-db',
  connectionLimit: 20
})
```

Environment variables take precedence over constructor options.

## Development Status

This is an active development project. The core architecture is implemented, but several features referenced in examples and tests are not yet complete:

### Next Steps
1. Implement `where()` method in Builder class
2. Add support for complex WHERE conditions
3. Implement additional execution methods
4. Add graceful shutdown functionality shown in usage-examples
5. Add comprehensive error handling
6. Add transaction support

## Dependencies

- **mysql2**: MySQL client with promise support
- **debug**: Debug logging utility  
- **@dotenvx/dotenvx**: Environment variable management

## License

ISC