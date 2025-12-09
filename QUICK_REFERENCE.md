# miniORM Quick Reference Guide

Quick reference for the most common operations with miniORM.

**Updated:** Includes new `distinct()`, `in()`, and `notIn()` methods!

---

## 🚀 Setup

```javascript
import miniORM from './miniORM.js'

const model = new miniORM()
```

---

## 📖 SELECT Queries

### Select All
```javascript
await model.fromTable('users').selectAll()
```

### Select Specific Columns
```javascript
await model.fromTable('users').select('id', 'name', 'email')
```

### Select with No Arguments ✨ NEW
```javascript
// Used with distinct() or other modifiers
await model.fromTable('users').select().distinct('email')
```

### Select Distinct ✨ NEW
```javascript
// Get unique email addresses
await model.fromTable('users').select().distinct('email')

// Get unique combinations
await model.fromTable('orders').select().distinct('customer_id', 'product_id')

// Get distinct roles
await model.fromTable('users').select().distinct('role')
```

### Select with WHERE
```javascript
await model.fromTable('users').select('*').where('status', '=', 'active')
```

### Count Records
```javascript
await model.fromTable('users').countRecords()
```

---

## 🔍 WHERE Conditions

### Basic WHERE
```javascript
.where('column', '=', 'value')
.where('age', '>', 18)
.where('name', 'LIKE', '%John%')
```

### AND Conditions
```javascript
.where('status', '=', 'active')
.andWhere('role', '=', 'admin')
```

### OR Conditions
```javascript
.where('role', '=', 'admin')
.orWhere('role', '=', 'moderator')
```

### IN / NOT IN
```javascript
.whereIn('role', ['admin', 'moderator', 'editor'])
.whereNotIn('status', ['banned', 'deleted'])
```

### Field-Based IN / NOT IN ✨ NEW
```javascript
// More readable alternative to whereIn()
.whereField('role').in(['admin', 'moderator', 'editor'])
.whereField('status').notIn(['banned', 'deleted', 'suspended'])
```

### NULL Checks
```javascript
.whereField('email_verified_at').isNull()
.whereField('deleted_at').isNotNull()
```

### BETWEEN
```javascript
.whereField('price').isBetween(10, 100)
.whereField('age').isNotBetween(13, 17)
```

---

## 🎯 Grouped Conditions

### AND Group
```javascript
.where('status', '=', 'active')
.andGroup((builder) => {
  return builder
    .where('role', '=', 'admin')
    .orWhere('department', '=', 'IT')
})
// WHERE status = 'active' AND (role = 'admin' OR department = 'IT')
```

### OR Group
```javascript
.where('status', '=', 'banned')
.orGroup((builder) => {
  return builder
    .where('role', '=', 'admin')
    .andWhere('override', '=', true)
})
// WHERE status = 'banned' OR (role = 'admin' AND override = true)
```

### Nested Groups
```javascript
.where('status', '=', 'active')
.andGroup((builder) => {
  return builder
    .where('role', '=', 'manager')
    .orGroup((nested) => {
      return nested
        .where('role', '=', 'admin')
        .andWhere('department', '=', 'HR')
    })
})
```

### Using New in() with Groups ✨ NEW
```javascript
.where('status', '=', 'active')
.andGroup((builder) => {
  return builder
    .whereField('role').in(['admin', 'moderator'])
    .orWhere('department', '=', 'IT')
})
// WHERE status = 'active' AND (role IN ('admin', 'moderator') OR department = 'IT')
```

---

## ✏️ INSERT

```javascript
const result = await model
  .fromTable('users')
  .insert({
    name: 'John Doe',
    email: 'john@example.com',
    status: 'active',
    created_at: new Date()
  })

console.log(result.insertId)
```

---

## 🔄 UPDATE

### Update with WHERE
```javascript
await model
  .fromTable('users')
  .update({
    status: 'inactive',
    updated_at: new Date()
  })
  .where('id', '=', 1)
```

### Bulk Update
```javascript
await model
  .fromTable('users')
  .update({ status: 'verified' })
  .where('email_verified', '=', true)
  .andWhere('status', '=', 'pending')
```

### Update Excluding Certain Values ✨ NEW
```javascript
await model
  .fromTable('users')
  .update({ last_updated: new Date() })
  .whereField('status')
  .notIn(['banned', 'deleted'])
```

---

## 🗑️ DELETE

### Delete with WHERE
```javascript
await model
  .fromTable('users')
  .delete()
  .where('status', '=', 'banned')
```

### Delete Multiple Conditions
```javascript
await model
  .fromTable('temp_logs')
  .delete()
  .where('created_at', '<', '2025-01-01')
  .andWhere('processed', '=', true)
```

### Delete Excluding Values ✨ NEW
```javascript
await model
  .fromTable('sessions')
  .delete()
  .whereField('user_id')
  .notIn([1, 2, 3]) // Don't delete admin sessions
```

---

## 📄 Pagination

```javascript
// Page 1 (first 20 records)
await model.fromTable('products').select('*').limit(20)

// Page 2 (records 21-40)
await model.fromTable('products').select('*').limit(20).offset(20)

// Page 3 (records 41-60)
await model.fromTable('products').select('*').limit(20).offset(40)
```

---

## 🔧 Type Casting

### Cast String to Number
```javascript
.where('age', '>', { value: '18', type: 'number' })
```

### Cast String to Boolean
```javascript
.where('is_active', '=', { value: 'true', type: 'boolean' })
```

### Cast to String
```javascript
.where('user_id', '=', { value: 123, type: 'string' })
```

---

## 🌐 Express Integration

### GET: Select Distinct ✨ NEW
```javascript
app.get('/unique-emails', async (req, res) => {
  try {
    const emails = await model
      .fromTable('users')
      .select()
      .distinct('email')
    
    res.json(emails)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})
```

### GET: Using whereField().in() ✨ NEW
```javascript
app.get('/posts/featured', async (req, res) => {
  try {
    const posts = await model
      .fromTable('posts')
      .select('id', 'title', 'author')
      .whereField('author')
      .in(['John Doe', 'Jane Smith', 'Bob Wilson'])
    
    res.json(posts)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})
```

### GET Endpoint
```javascript
app.get('/users', async (req, res) => {
  try {
    const users = await model
      .fromTable('users')
      .select('id', 'name', 'email')
      .where('status', '=', 'active')
    
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})
```

### POST Endpoint
```javascript
app.post('/users', async (req, res) => {
  try {
    const result = await model
      .fromTable('users')
      .insert({
        name: req.body.name,
        email: req.body.email,
        created_at: new Date()
      })
    
    res.status(201).json({ id: result.insertId })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})
```

### PUT Endpoint
```javascript
app.put('/users/:id', async (req, res) => {
  try {
    const result = await model
      .fromTable('users')
      .update({
        name: req.body.name,
        updated_at: new Date()
      })
      .where('id', '=', { value: req.params.id, type: 'number' })
    
    res.json({ success: true, affected: result.affectedRows })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})
```

### DELETE Endpoint with Exclusions ✨ NEW
```javascript
app.delete('/users/:id', async (req, res) => {
  try {
    const result = await model
      .fromTable('users')
      .delete()
      .where('id', '=', { value: req.params.id, type: 'number' })
      .andWhere((builder) => {
        return builder
          .whereField('role')
          .notIn(['admin', 'superadmin'])
      })
    
    res.json({ success: true, affected: result.affectedRows })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})
```

---

## 🔍 Query State Inspection

```javascript
const query = model
  .fromTable('users')
  .select()
  .distinct('email')
  .whereField('status')
  .notIn(['banned', 'deleted'])

// Inspect before executing
console.log(query.state.query)  // Query parts array
console.log(query.state.values) // Values array
console.log(query.table)        // Table name

// Execute
const results = await query.done()
```

---

## 🐛 Debug Mode

```bash
# Debug all
DEBUG=miniORM:* node app.js

# Debug queries only
DEBUG=miniORM:query node app.js

# Debug database only
DEBUG=miniORM:db node app.js
```

---

## ⚙️ Environment Variables

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=your_database
DB_PORT=3306
CONNECTION_LIMIT=10
```

---

## 🎨 Common Patterns

### Multiple Tables
```javascript
const usersModel = new miniORM()
const postsModel = new miniORM()

const users = await usersModel.fromTable('users').selectAll()
const posts = await postsModel.fromTable('posts').selectAll()
```

### Reusable Base Query
```javascript
const activeUsersBase = model.fromTable('users').where('status', '=', 'active')

// Different queries from same base
const admins = await activeUsersBase.andWhere('role', '=', 'admin')
const editors = await activeUsersBase.andWhere('role', '=', 'editor')
```

### Get Distinct Values ✨ NEW
```javascript
// Get all unique departments
const departments = await model
  .fromTable('users')
  .select()
  .distinct('department')

// Get unique role-department combinations
const combos = await model
  .fromTable('users')
  .select()
  .distinct('role', 'department')
```

### Dynamic Conditions
```javascript
async function getUsers(filters) {
  let query = model.fromTable('users').select('*')
  
  if (filters.status) {
    query = query.where('status', '=', filters.status)
  }
  
  if (filters.roles && filters.roles.length > 0) {
    query = query.andWhere((builder) => {
      return builder.whereField('role').in(filters.roles)
    })
  }
  
  if (filters.minAge) {
    query = query.andWhere('age', '>=', filters.minAge)
  }
  
  return await query.done()
}

// Usage
const users = await getUsers({
  status: 'active',
  roles: ['admin', 'moderator'],
  minAge: 18
})
```

---

## ✅ Best Practices

### 1. Always Use WHERE with DELETE/UPDATE
```javascript
// ✅ Good
await model.fromTable('users').delete().where('id', '=', 1)

// ❌ Dangerous
await model.fromTable('users').delete()
```

### 2. Type Cast User Input
```javascript
// ✅ Good
.where('id', '=', { value: req.params.id, type: 'number' })

// ⚠️ Risky
.where('id', '=', req.params.id)
```

### 3. Use distinct() for Unique Values ✨ NEW
```javascript
// ✅ Good - efficient database query
await model.fromTable('users').select().distinct('email')

// ⚠️ Less efficient - requires post-processing
const users = await model.fromTable('users').select('email')
const unique = [...new Set(users.map(u => u.email))]
```

### 4. Choose Between whereIn() and whereField().in() ✨ NEW
```javascript
// ✅ Both are valid - use what reads better

// Traditional approach
.whereIn('status', ['active', 'pending'])

// New field-based approach (more readable in chains)
.whereField('status').in(['active', 'pending'])
```

### 5. Use Groups for Complex Logic
```javascript
// ✅ Clear and readable
.where('status', '=', 'active')
.andGroup((builder) => {
  return builder
    .whereField('role').in(['admin', 'moderator'])
    .orWhere('department', '=', 'IT')
})
```

### 6. Error Handling
```javascript
try {
  const users = await model.fromTable('users').selectAll()
  return users
} catch (error) {
  console.error('Database error:', error.message)
  throw error
}
```

---

## 🚫 Common Mistakes

### Cannot Chain where() After where()
```javascript
// ❌ Wrong
.where('status', '=', 'active').where('role', '=', 'admin')

// ✅ Correct
.where('status', '=', 'active').andWhere('role', '=', 'admin')
```

### Cannot Use offset() Without limit()
```javascript
// ❌ Wrong
.select('*').offset(20)

// ✅ Correct
.select('*').limit(20).offset(20)
```

### fromTable() Must Be First
```javascript
// ❌ Wrong
.select('*').fromTable('users')

// ✅ Correct
.fromTable('users').select('*')
```

### Cannot End With Logical Operator
```javascript
// ❌ Wrong
.where('status', '=', 'active').and().done()

// ✅ Correct
.where('status', '=', 'active').andWhere('role', '=', 'admin').done()
```

### distinct() Requires Columns ✨ NEW
```javascript
// ❌ Wrong
.select().distinct()

// ✅ Correct
.select().distinct('email')
.select().distinct('role', 'department')
```

### distinct() Must Follow select() ✨ NEW
```javascript
// ❌ Wrong
.fromTable('users').distinct('email')

// ✅ Correct
.fromTable('users').select().distinct('email')
```

---

## 📊 Operator Reference

| Operator | Description | Example |
|----------|-------------|---------|
| `=` | Equal | `.where('status', '=', 'active')` |
| `!=` | Not equal | `.where('status', '!=', 'banned')` |
| `<>` | Not equal (alt) | `.where('status', '<>', 'banned')` |
| `>` | Greater than | `.where('age', '>', 18)` |
| `>=` | Greater or equal | `.where('age', '>=', 21)` |
| `<` | Less than | `.where('price', '<', 100)` |
| `<=` | Less or equal | `.where('price', '<=', 50)` |
| `LIKE` | Pattern match | `.where('name', 'LIKE', '%John%')` |
| `NOT LIKE` | Negative pattern | `.where('name', 'NOT LIKE', '%spam%')` |

---

## 🎯 Method Categories

### Must Be First
- `fromTable()`
- `insert()`
- `update()`
- `countRecords()`

### Query Builders
- `select()` - ✨ Now supports no arguments
- `selectAll()`
- `distinct()` - ✨ NEW
- `delete()`

### Conditions
- `where()`
- `andWhere()`
- `orWhere()`
- `whereIn()`
- `whereNotIn()`
- `whereField()`

### Field Operators (After whereField)
- `isNull()`
- `isNotNull()`
- `isBetween()`
- `isNotBetween()`
- `in()` - ✨ NEW
- `notIn()` - ✨ NEW

### Logical
- `and()`
- `or()`
- `andGroup()`
- `orGroup()`

### Pagination
- `limit()`
- `offset()` (must follow limit)

### Execution
- `done()`
- Direct await (Promise-like)

---

## ✨ What's New in This Version

### 1. `select()` with No Arguments
```javascript
// Now you can call select() without arguments
model.fromTable('users').select().distinct('email')
```

### 2. `distinct()` Method
```javascript
// Get unique values from columns
model.fromTable('users').select().distinct('email')
model.fromTable('orders').select().distinct('customer_id', 'product_id')
```

### 3. `in()` Field Operator
```javascript
// More readable than whereIn() in complex chains
model.fromTable('posts')
  .select('*')
  .whereField('author').in(['John', 'Jane'])
```

### 4. `notIn()` Field Operator
```javascript
// Cleaner syntax for NOT IN conditions
model.fromTable('users')
  .select('*')
  .whereField('status').notIn(['banned', 'deleted'])
```

---

## 📊 Complete Method List (Updated)

**Total: 32 methods** (4 new additions!)

- Core: `new miniORM()`, `fromTable()`, `setTable()`, `done()`, `then()`
- Query: `select()` ✨, `distinct()` ✨, `selectAll()`, `countRecords()`, `insert()`, `update()`, `delete()`
- WHERE: `where()`, `andWhere()`, `orWhere()`, `whereIn()`, `whereNotIn()`, `whereField()`
- Field Ops: `isNull()`, `isNotNull()`, `isBetween()`, `isNotBetween()`, `in()` ✨, `notIn()` ✨
- Logical: `and()`, `or()`, `andGroup()`, `orGroup()`
- Pagination: `limit()`, `offset()`
- Properties: `state`, `table`, `operatorSignal`

---

**Need more help? Check CURRENT_API_SUMMARY.md for complete documentation.**

---

*Last Updated: 2025 - Now with distinct() and field-based in()/notIn() support!*