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

## Running the Example

```bash
node index.js
```

The example server will start on port 3000 (or PORT environment variable) and demonstrates querying a 'posts' table.

## License

ISC