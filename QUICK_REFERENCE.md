# miniORM Quick Reference Guide

Quick reference for the most common operations with miniORM.

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
  .where('created_at', '<', '2024-01-01')
  .andWhere('processed', '=', true)
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

### DELETE Endpoint
```javascript
app.delete('/users/:id', async (req, res) => {
  try {
    const result = await model
      .fromTable('users')
      .delete()
      .where('id', '=', { value: req.params.id, type: 'number' })
    
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
  .select('id', 'name')
  .where('status', '=', 'active')

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

### Dynamic Conditions
```javascript
async function getUsers(filters) {
  let query = model.fromTable('users').select('*')
  
  if (filters.status) {
    query = query.where('status', '=', filters.status)
  }
  
  if (filters.role) {
    query = query.andWhere('role', '=', filters.role)
  }
  
  if (filters.minAge) {
    query = query.andWhere('age', '>=', filters.minAge)
  }
  
  return await query.done()
}
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

### 3. Use Groups for Complex Logic
```javascript
// ✅ Clear and readable
.where('status', '=', 'active')
.andGroup((builder) => {
  return builder
    .where('role', '=', 'admin')
    .orWhere('role', '=', 'moderator')
})
```

### 4. Error Handling
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
- `select()`
- `selectAll()`
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

**Need more help? Check CURRENT_API_SUMMARY.md for complete documentation.**