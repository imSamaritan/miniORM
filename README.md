# miniORM

A lightweight Object-Relational Mapping (ORM) library for Node.js with MySQL support, built with clean inheritance architecture.

## Architecture

The miniORM follows a clean inheritance pattern:

- **miniORM (Base Class)**: Core functionality including connection management, state handling, and query execution
- **Builder (Extended Class)**: Query building methods like `select()`, `where()`, `and()`, `or()`

This separation provides better modularity, easier testing, and cleaner code organization.

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
const Builder = require('./builder/Builder')

// Create a new instance
const model = new Builder()
model.setTable('users')

// Build and execute queries
const users = await model
  .select('id', 'name', 'email')
  .where({ status: 'active' })
  .done()
```

### Import Options

```javascript
// Option 1: Import Builder directly
const Builder = require('./builder/Builder')
const model = new Builder()

// Option 2: Import from main module
const miniORM = require('./miniORM')
const model = new miniORM.Builder()

// Option 3: Use core miniORM (without query building methods)
const miniORM = require('./miniORM')
const coreModel = new miniORM()
```

## API Reference

### Core Methods (miniORM)

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

### Query Building Methods (Builder)

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
Add WHERE condition.

```javascript
model.where({ id: 1 })
model.where({ status: 'active' })
```

#### `and()` / `or()`
Add logical operators between conditions.

```javascript
model
  .select('*')
  .where({ status: 'active' })
  .and()
  .where({ role: 'admin' })
```

## Examples

### Select with Single Condition

```javascript
const activeUsers = await model
  .select('id', 'name')
  .where({ status: 'active' })
  .done()
```

### Select with Multiple Conditions

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

## Architecture Benefits

1. **Separation of Concerns**: Core functionality separated from query building
2. **No Circular Dependencies**: Clean inheritance hierarchy
3. **Extensible**: Easy to add new query methods to Builder class
4. **Type Safety**: Proper inheritance chain for method chaining
5. **Testable**: Each class can be tested independently

## Error Handling

The ORM includes built-in validation:

- Empty or null column names are rejected
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

## Development

### Project Structure

```
miniORM/
├── miniORM.js          # Base ORM class
├── builder/
│   └── Builder.js      # Query builder class (extends miniORM)
├── execute/
│   └── execute.js      # Query execution logic
├── db/
│   └── db.js          # Database connection management
└── index.js           # Example application
```

### Running the Example

```bash
node index.js
```

The example server will start on port 5500 (or PORT environment variable).

## License

ISC