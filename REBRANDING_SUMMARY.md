# Rebranding Summary: miniORM → mySQLizer

## Overview

This document summarizes the rebranding of the project from **miniORM** to **mySQLizer**, including the rationale and changes made.

---

## 🎯 Rationale

### Why the Change?

1. **Accurate Positioning**: The library is a **query builder**, not a full-featured ORM
2. **Clear Purpose**: The name "mySQLizer" immediately communicates its MySQL-specific nature
3. **Avoid Confusion**: "ORM" implies features like models, relationships, migrations, and schema management that this library doesn't provide
4. **Better Marketing**: Query builders appeal to developers who want control without complexity

### What is mySQLizer?

**mySQLizer is a MySQL query builder** that provides:
- ✅ Fluent, chainable API for building SQL queries
- ✅ Immutable builder pattern
- ✅ Direct database interaction with prepared statements
- ✅ Type casting and parameter binding
- ✅ Connection pool management

**mySQLizer is NOT an ORM** - it does not provide:
- ❌ Model definitions and active records
- ❌ Relationship mapping (hasMany, belongsTo, etc.)
- ❌ Database migrations
- ❌ Schema management
- ❌ Automatic table/model synchronization

---

## 📝 Changes Made

### 1. Core Files

| Old Name | New Name | Status |
|----------|----------|--------|
| `miniORM.js` | `mySQLizer.js` | ✅ Renamed |
| Class: `miniORM` | Class: `mySQLizer` | ✅ Renamed |

### 2. Package Information

**package.json Updates:**
- `name`: `@miniorm-author/miniorm` → `@mysqlizer/mysqlizer`
- `description`: Updated to emphasize "query builder" instead of "ORM"
- `main`: `miniORM.js` → `mySQLizer.js`
- `keywords`: Removed "orm", added "query-builder", "fluent-api", "builder-pattern"

### 3. Debug Namespaces

| Old Namespace | New Namespace |
|---------------|---------------|
| `miniORM:query` | `mySQLizer:query` |
| `miniORM:db` | `mySQLizer:db` |
| `miniORM:options` | `mySQLizer:options` |

### 4. Documentation

**README.md:**
- Complete rewrite with mySQLizer branding
- Added "What is mySQLizer?" section
- Added "Query Builder vs ORM" comparison
- Updated all code examples
- Updated all variable names (`model` → `db` for better semantics)

### 5. Import Statements

All files now use:
```javascript
import mySQLizer from './mySQLizer.js'
const db = new mySQLizer()
```

Instead of:
```javascript
import miniORM from './miniORM.js'
const model = new miniORM()
```

---

## 🔄 Migration Guide

### For Existing Users

If you were using miniORM, here's how to migrate:

#### Step 1: Update Imports

```javascript
// Old
import miniORM from './miniORM.js'

// New
import mySQLizer from './mySQLizer.js'
```

#### Step 2: Update Class Instantiation

```javascript
// Old
const model = new miniORM()

// New
const db = new mySQLizer()
```

#### Step 3: Update Variable Names (Optional but Recommended)

```javascript
// Old
const users = await model.fromTable('users').selectAll()

// New
const users = await db.fromTable('users').selectAll()
```

#### Step 4: Update Debug Environment Variables

```bash
# Old
DEBUG=miniORM:* node app.js

# New
DEBUG=mySQLizer:* node app.js
```

### API Compatibility

**Good news:** The API is 100% compatible! Only the class name changed.

All methods remain the same:
- ✅ `fromTable()`, `setTable()`
- ✅ `select()`, `distinct()`, `selectAll()`
- ✅ `where()`, `andWhere()`, `orWhere()`
- ✅ `whereField()`, `in()`, `notIn()`
- ✅ `insert()`, `update()`, `delete()`
- ✅ All other methods unchanged

---

## 📊 Comparison: Query Builder vs ORM

### mySQLizer (Query Builder)

```javascript
const db = new mySQLizer()

// Build queries with fluent API
const users = await db
  .fromTable('users')
  .select('id', 'name', 'email')
  .where('status', '=', 'active')
  .limit(10)

// You control the queries
```

### Traditional ORM (e.g., TypeORM, Sequelize)

```javascript
// Define models
@Entity()
class User {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column()
  name: string;
  
  @ManyToOne(() => Role)
  role: Role;
}

// Use models
const users = await User.find({
  where: { status: 'active' },
  take: 10,
  relations: ['role']
})

// ORM abstracts everything
```

---

## 🎯 Benefits of the Rebrand

1. **Clarity**: Developers immediately understand what mySQLizer does
2. **Correct Expectations**: No confusion about ORM features
3. **Target Audience**: Appeals to developers who want SQL control
4. **SEO & Discoverability**: "MySQL query builder" is a common search term
5. **Identity**: Unique, memorable name in the ecosystem

---

## 📦 NPM Package Name

**Recommended package name:** `@mysqlizer/mysqlizer`

Alternative options:
- `mysqlizer`
- `@mysqlizer/core`
- `mysql-query-builder` (too generic)

---

## 🚀 Next Steps

### Immediate
- [x] Rename core class and files
- [x] Update package.json
- [x] Rewrite README.md
- [x] Update debug namespaces

### Pending (User Action Required)
- [ ] Update files with unsaved changes:
  - `index.js`
  - `simple-examples.js`
  - `auto-example.js`
  - `example-app.js`
- [ ] Update example files in `/examples` directory
- [ ] Update all documentation files (QUICK_START.md, etc.)
- [ ] Test all examples
- [ ] Update GitHub repository name
- [ ] Publish to NPM under new name

---

## 📚 Related Documentation

After rebranding, update these files:
- `QUICK_START.md`
- `CURRENT_API_SUMMARY.md`
- `API_STRUCTURE.md`
- `QUICK_REFERENCE.md`
- All alignment and changelog documents

---

## 💡 Marketing Message

**Old Message:**
> A lightweight ORM for Node.js with MySQL support

**New Message:**
> A lightweight, fluent MySQL query builder for Node.js - Simple SQL building without ORM complexity

**Tagline Options:**
- "Simple MySQL queries, beautifully chained"
- "SQL power with JavaScript elegance"
- "Query builder, not query blocker"
- "Build MySQL queries like you mean it"

---

## ✅ Verification Checklist

- [x] Core class renamed: `miniORM` → `mySQLizer`
- [x] Main file renamed: `miniORM.js` → `mySQLizer.js`
- [x] package.json updated
- [x] README.md rewritten
- [x] Debug namespaces updated
- [x] Project identity clarified (query builder, not ORM)
- [ ] All example files updated
- [ ] All documentation files updated
- [ ] Tests passing
- [ ] Ready for NPM publication

---

## 📞 Contact

For questions about the rebranding or migration assistance, please:
- Open an issue on GitHub
- Check the updated documentation
- Review the migration guide above

---

**Version:** 1.0.0  
**Date:** 2025  
**Status:** Core rebranding complete, awaiting file updates