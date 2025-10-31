# miniORM

A lightweight Object-Relational Mapping (ORM) library for Node.js with MySQL support and automatic connection pool management.

## Architecture

miniORM uses a clean inheritance pattern where the main `miniORM` class extends the `Builder` class:

- **Builder (Base Class)**: Query building methods like `select()`, `where()`, `and()`, `or()`
- **miniORM (Extended Class)**: Core functionality including connection management, state handling, and query execution
- **Execute Module**: Handles SQL query execution with mysql2
- **DB Module**: Manages connection pool with promise-based locking and automatic cleanup

## Key Features

- **Immutable Builder Pattern**: Each query method returns a new instance, preserving state integrity
- **Promise Lock Technique**: Prevents multiple concurrent database connections using shared pool
- **Automatic Connection Cleanup**: Pool automatically closes on process termination (SIGINT, SIGTERM, exit)
- **Debug Support**: Built-in debugging with configurable namespaces

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

## Usage

### Basic Usage

```javascript
import miniORM from './miniORM.js'

// Create a new instance
const model = new miniORM()
model.setTable('users')

// Build and execute queries
const users = await model
  .select('id', 'name', 'email')
  .where({ status: 'active' })
  .done()
```

### Connection Pool Management

Connection pools are handled automatically:
- **Single Pool**: All miniORM instances share the same connection pool
- **Auto-Cleanup**: Pool closes automatically when process exits
- **No Manual Management**: No need to call `.close()` or `.end()`

```javascript
// Multiple instances share the same pool automatically
const postsModel = new miniORM()
const usersModel = new miniORM()

postsModel.setTable('posts')
usersModel.setTable('users')

// Both use the same underlying connection pool
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
Select specific columns.

```javascript
model.select('id', 'name', 'email')
model.select('*') // Select all columns
```

#### `selectAll()`
Select all columns (equivalent to `select('*')`).

```javascript
model.selectAll()
```

#### `where(condition)`
Add WHERE condition with a single key-value pair.

```javascript
model.where({ id: 1 })
model.where({ status: 'active' })
```

#### `and()`
Add AND operator between conditions.

```javascript
model
  .select('*')
  .where({ status: 'active' })
  .and()
  .where({ role: 'admin' })
```

#### `or()`
Add OR operator between conditions.

```javascript
model
  .select('*')
  .where({ role: 'admin' })
  .or()
  .where({ role: 'moderator' })
```

## Examples

### Select with Single Condition

```javascript
const activeUsers = await model
  .select('id', 'name')
  .where({ status: 'active' })
  .done()
```

### Select with Multiple AND Conditions

```javascript
const adminUsers = await model
  .select('*')
  .where({ status: 'active' })
  .and()
  .where({ role: 'admin' })
  .done()
```

### Select with OR Condition

```javascript
const users = await model
  .select('id', 'name')
  .where({ role: 'admin' })
  .or()
  .where({ role: 'moderator' })
  .done()
```

## Error Handling

The ORM includes built-in validation:

- Empty, null, or undefined column names are rejected
- Queries cannot end with logical operators (AND/OR)
- Missing database configuration throws descriptive errors

```javascript
try {
  const results = await model.select('id').where({ status: 'active' }).done()
} catch (error) {
  console.error('Query failed:', error.message)
}
```

## Debug Mode

Enable debug logging:

```bash
DEBUG=miniORM:* node your-app.js
```

Debug namespaces:
- `miniORM:query` - SQL queries and parameters
- `miniORM:db` - Database connection events
- `miniORM:options` - Configuration options

## Automatic Connection Management

miniORM automatically handles database connections:

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
// Connection pool will automatically close when process terminates
```

### What Happens Automatically

1. **Pool Creation**: First database query creates a shared connection pool
2. **Pool Reuse**: All subsequent miniORM instances use the same pool
3. **Cleanup Registration**: Process exit handlers are automatically registered
4. **Graceful Shutdown**: Pool closes on SIGINT, SIGTERM, or normal exit

## Project Structure

```
miniORM/
├── miniORM.js          # Main ORM class (extends Builder)
├── builder/
│   └── Builder.js      # Query builder base class with immutable pattern
├── execute/
│   └── Execute.js      # Query execution logic
├── db/
│   └── db.js          # Connection pool management with promise locking
├── index.js           # Production example application
├── auto-example.js    # Simple usage example
└── usage-examples.js  # Comprehensive usage patterns
```

## Implementation Details

### Immutable Builder Pattern

Each query method creates a new instance with updated state:

```javascript
// Each method returns a new miniORM instance
const query1 = model.select('id', 'name')
const query2 = query1.where({ status: 'active' })
const query3 = query2.and().where({ role: 'admin' })

// Original model remains unchanged
console.log(model.state) // { query: [], values: [] }
console.log(query3.state) // { query: [...], values: [...] }
```

### Promise Lock Technique

The database module prevents race conditions:

```javascript
// Multiple concurrent calls share the same pool creation promise
const model1 = new miniORM()
const model2 = new miniORM()

// Both will use the same poolPromise, preventing duplicate connections
const [results1, results2] = await Promise.all([
  model1.setTable('users').selectAll().done(),
  model2.setTable('posts').selectAll().done()
])
```

## Running the Examples

### Basic Auto-Cleanup Example
```bash
node auto-example.js
```

### Production-Ready Example
```bash
node index.js
```

### Comprehensive Usage Patterns
```bash
DEBUG=miniORM:* node usage-examples.js
```

All examples demonstrate automatic connection management and graceful shutdown handling.

## Configuration Options

Pass custom database options to the constructor:

```javascript
const customModel = new miniORM({
  host: 'custom-host',
  user: 'custom-user',
  password: 'custom-password',
  database: 'custom-db',
  connectionLimit: 20
})
```

Environment variables take precedence over constructor options.

## License

ISC