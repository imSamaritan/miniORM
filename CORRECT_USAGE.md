# mySQLizer - Correct Usage Reference Card

**Quick reference for using mySQLizer with correct naming and imports**

---

## ✅ Installation

```bash
npm install mysqlizer
```

---

## ✅ Correct Import (NPM Package)

```javascript
import mySQLizer from 'mysqlizer'
```

---

## ✅ Correct Import (Local Development)

```javascript
import mySQLizer from './mySQLizer.js'
```

---

## ✅ Correct Class Instantiation

```javascript
// Basic
const db = new mySQLizer()

// With configuration
const db = new mySQLizer({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'mydb',
  connectionLimit: 10
})
```

---

## ✅ Correct Debug Commands

### Unix/Linux/Mac
```bash
DEBUG=mySQLizer:* node app.js
DEBUG=mySQLizer:query node app.js
DEBUG=mySQLizer:db node app.js
```

### Windows CMD
```cmd
set DEBUG=mySQLizer:* && node app.js
set DEBUG=mySQLizer:query && node app.js
```

### Windows PowerShell
```powershell
$env:DEBUG="mySQLizer:*"; node app.js
$env:DEBUG="mySQLizer:query"; node app.js
```

---

## ✅ Correct Usage Examples

### Basic SELECT Query
```javascript
import mySQLizer from 'mysqlizer'

const db = new mySQLizer()

const users = await db
  .fromTable('users')
  .select('id', 'name', 'email')
  .where('status', '=', 'active')
  .limit(10)
```

### INSERT Query
```javascript
const result = await db
  .fromTable('users')
  .insert({
    name: 'John Doe',
    email: 'john@example.com',
    status: 'active'
  })

console.log('Inserted ID:', result.insertId)
```

### UPDATE Query
```javascript
const result = await db
  .fromTable('users')
  .update({ status: 'inactive' })
  .where('id', '=', { value: 1, type: 'number' })

console.log('Affected rows:', result.affectedRows)
```

### DELETE Query
```javascript
const result = await db
  .fromTable('users')
  .delete()
  .where('status', '=', 'banned')

console.log('Deleted rows:', result.affectedRows)
```

---

## ✅ Available Debug Namespaces

| Namespace | Description |
|-----------|-------------|
| `mySQLizer:query` | SQL queries and values |
| `mySQLizer:db` | Connection pool events |
| `mySQLizer:options` | Configuration options |
| `mySQLizer:*` | All namespaces |

---

## ✅ Environment Variables

Create a `.env` file:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=your_database
DB_PORT=3306
CONNECTION_LIMIT=10
```

---

## ❌ WRONG - Don't Use These

### ❌ Wrong Package Name
```javascript
import miniORM from 'miniorm'  // WRONG!
```

### ❌ Wrong File Name
```javascript
import miniORM from './miniORM.js'  // WRONG! File doesn't exist
```

### ❌ Wrong Class Name
```javascript
const db = new miniORM()  // WRONG!
```

### ❌ Wrong Debug Namespace
```bash
DEBUG=miniORM:* node app.js  # WRONG!
```

---

## ✅ Complete Express.js Example

```javascript
import express from 'express'
import mySQLizer from 'mysqlizer'

const app = express()
const db = new mySQLizer()

app.use(express.json())

// GET all users
app.get('/users', async (req, res) => {
  try {
    const users = await db
      .fromTable('users')
      .selectAll()
    
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET single user
app.get('/users/:id', async (req, res) => {
  try {
    const [user] = await db
      .fromTable('users')
      .selectAll()
      .where('id', '=', { value: req.params.id, type: 'number' })
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST create user
app.post('/users', async (req, res) => {
  try {
    const result = await db
      .fromTable('users')
      .insert(req.body)
    
    res.status(201).json({ 
      id: result.insertId,
      message: 'User created' 
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// PUT update user
app.put('/users/:id', async (req, res) => {
  try {
    const result = await db
      .fromTable('users')
      .update(req.body)
      .where('id', '=', { value: req.params.id, type: 'number' })
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    res.json({ message: 'User updated' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// DELETE user
app.delete('/users/:id', async (req, res) => {
  try {
    const result = await db
      .fromTable('users')
      .delete()
      .where('id', '=', { value: req.params.id, type: 'number' })
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    res.json({ message: 'User deleted' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
```

---

## ✅ Testing Your Setup

```bash
# 1. Install the package
npm install mysqlizer

# 2. Create .env file with database credentials

# 3. Test import
node -e "import('./mySQLizer.js').then(() => console.log('✅ Import OK'))"

# 4. Run examples
node simple-examples.js
node auto-example.js
node index.js

# 5. Test with debugging
DEBUG=mySQLizer:* node simple-examples.js
```

---

## ✅ Key Points to Remember

1. **Package name:** `mysqlizer` (lowercase, no spaces)
2. **Class name:** `mySQLizer` (camelCase with capital SQL)
3. **Main file:** `mySQLizer.js` (camelCase with capital SQL)
4. **Debug namespace:** `mySQLizer:*` (camelCase with capital SQL)
5. **Import source:** `'mysqlizer'` for NPM, `'./mySQLizer.js'` for local

---

## ✅ Quick Commands Reference

```bash
# Install
npm install mysqlizer

# Run examples
node simple-examples.js
node auto-example.js
node index.js

# Run with debug (Unix)
DEBUG=mySQLizer:* node app.js

# Run with debug (Windows CMD)
set DEBUG=mySQLizer:* && node app.js

# Run with debug (Windows PowerShell)
$env:DEBUG="mySQLizer:*"; node app.js

# Test import
node -e "import('./mySQLizer.js').then(m => console.log('OK'))"
```

---

## 📚 More Information

- 📖 [README.md](README.md) - Full documentation
- 📘 [INSTALLATION.md](INSTALLATION.md) - Installation guide
- 📗 [QUICK_START.md](QUICK_START.md) - Quick start guide
- 📄 [ALIGNMENT_COMPLETE.md](ALIGNMENT_COMPLETE.md) - Alignment report

---

**mySQLizer v1.0.0** - A lightweight MySQL query builder for Node.js

✅ Always use `mySQLizer` (not miniORM)  
✅ Always import from `mysqlizer` or `./mySQLizer.js`  
✅ Always use debug namespace `mySQLizer:*`

---

*Last updated: 2025*