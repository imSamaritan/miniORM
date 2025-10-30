# miniORM

A lightweight Object-Relational Mapping (ORM) library for Node.js with MySQL support.

## Architecture

miniORM uses a clean inheritance pattern where the main `miniORM` class extends the `Builder` class:

- **Builder (Base Class)**: Query building methods like `select()`, `where()`, `and()`, `or()`
- **miniORM (Extended Class)**: Core functionality including connection management, state handling, and query execution

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

## Project Structure

```
miniORM/
├── miniORM.js          # Main ORM class (extends Builder)
├── builder/
│   └── builder.js      # Query builder base class
├── execute/
│   └── execute.js      # Query execution logic
├── db/
│   └── db.js          # Database connection management
└── index.js           # Example application
```

## Library Usage in Production

### For Library Users

miniORM automatically handles graceful shutdown by default - **no configuration required!**

#### Default Behavior (Zero Configuration)

```javascript
import express from 'express'
import miniORM from 'miniorm'

const app = express()

// That's it! Auto shutdown is enabled by default
app.get('/', async (req, res) => {
  const model = new miniORM()
  model.setTable('users')
  const users = await model.selectAll().done()
  res.json(users)
})

app.listen(3000)
// miniORM automatically handles SIGTERM, SIGINT, SIGUSR2, and errors
```

#### Disable Auto Shutdown (For Manual Control)

```javascript
import miniORM from 'miniorm'

// Disable auto shutdown if you want full control
miniORM.setAutoShutdown(false)

// Now you handle shutdown yourself
const customShutdown = async (signal) => {
  console.log(`${signal} received. Custom shutdown logic...`)
  
  try {
    await closeHttpServer()
    await miniORM.closeConnection()
    process.exit(0)
  } catch (error) {
    console.error('Error during shutdown:', error)
    process.exit(1)
  }
}

process.on('SIGTERM', () => customShutdown('SIGTERM'))
process.on('SIGINT', () => customShutdown('SIGINT'))
```

#### Custom Shutdown Logic (Override Auto Behavior)

```javascript
import miniORM from 'miniorm'

const beforeShutdown = async (signal) => {
  console.log('Closing HTTP server...')
  // Your custom pre-shutdown logic
}

const afterShutdown = async (signal) => {
  console.log('Cleanup complete...')
  // Your custom post-shutdown logic
}

// This overrides auto shutdown with custom callbacks
miniORM.setupGracefulShutdown(beforeShutdown, afterShutdown)
```

### Available Methods

#### `miniORM.setAutoShutdown(enabled)`
Enable or disable automatic shutdown handling (enabled by default).

```javascript
// Disable auto shutdown for full manual control
miniORM.setAutoShutdown(false)

// Re-enable auto shutdown
miniORM.setAutoShutdown(true)
```

#### `miniORM.setupGracefulShutdown(beforeShutdown?, afterShutdown?, signals?)`
Override auto shutdown with custom callbacks or signals.

**Parameters:**
- `beforeShutdown` (optional): Function to run before closing database connections
- `afterShutdown` (optional): Function to run after closing database connections  
- `signals` (optional): Array of signals to listen for (defaults to `['SIGTERM', 'SIGINT', 'SIGUSR2']`)

```javascript
// Override auto shutdown with custom callbacks
miniORM.setupGracefulShutdown(beforeCallback, afterCallback)

// Override with custom signals
miniORM.setupGracefulShutdown(null, null, ['SIGTERM', 'SIGINT', 'SIGHUP'])
```

#### `miniORM.gracefulShutdown(signal, beforeShutdown?, afterShutdown?)`
Manual graceful shutdown method (used internally by auto shutdown).

```javascript
// Manual shutdown call
await miniORM.gracefulShutdown('SIGTERM')

// With custom callbacks
await miniORM.gracefulShutdown('SIGINT', beforeFn, afterFn)
```

#### `miniORM.closeConnection()`
Direct database connection cleanup (no signal handling).

```javascript
// Direct cleanup - use when auto shutdown is disabled
try {
  await miniORM.closeConnection()
  console.log('All database connections closed')
} catch (error) {
  console.error('Error closing connections:', error)
}
```

### Design Philosophy

miniORM prioritizes **ease of use** while providing **control** when needed:

- **Zero Configuration**: Auto shutdown works out of the box
- **Prevents Memory Leaks**: Automatically closes connections on app termination
- **Flexible Override**: Easy to customize or disable auto behavior
- **Production Ready**: Handles SIGTERM, SIGINT, SIGUSR2, and error cases
- **Developer Friendly**: Less boilerplate code, fewer forgotten cleanups

## Running the Examples

### Auto Shutdown Example (Recommended)
```bash
node auto-example.js
```
Zero configuration - just import and use! Auto shutdown handles everything.

### Manual Control Example
```bash
node manual-control-example.js
```
For when you need complete control over shutdown behavior.

### Legacy Examples
```bash
node index.js
node example-app.js
```

### Comprehensive Usage Patterns
```bash
DEBUG=examples:*,miniORM:* node usage-examples.js
```

All examples start on port 3000 (or PORT environment variable) and demonstrate querying a 'posts' table.

### Quick Start Recommendations

**For Most Apps:** Just import and use - auto shutdown handles everything

**For Custom Logic:** Use `miniORM.setupGracefulShutdown(beforeFn, afterFn)`

**For Full Control:** Use `miniORM.setAutoShutdown(false)` and handle signals manually

## License

ISC