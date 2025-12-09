# miniORM API Changelog

**Project:** miniORM  
**Version:** 1.0.0 (Updated)  
**Last Updated:** 2025

---

## 🆕 Latest Version - New Features Added

### Version 1.0.0 Update (2025)

This update adds 4 new features to the miniORM API, enhancing query building capabilities while maintaining full backward compatibility.

---

## ✨ New Features

### 1. `select()` - Enhanced to Support No Arguments

**Type:** Enhancement  
**Category:** Query Building  
**Breaking Change:** No ❌

#### What Changed

Previously, `select()` required at least one column argument. Now it can be called without arguments to enable flexible query building with modifiers like `distinct()`.

#### Before
```javascript
// This was invalid
model.fromTable('users').select()
```

#### After
```javascript
// Now valid - enables use with distinct()
model.fromTable('users').select().distinct('email')

// Still works with columns as before
model.fromTable('users').select('id', 'name') // Unchanged
```

#### Use Cases
- Building queries with `distinct()`
- Flexible query construction patterns
- Conditional column selection

---

### 2. `distinct(...columns)` - New Method

**Type:** New Method  
**Category:** Query Building  
**Breaking Change:** No ❌

#### What It Does

Returns unique values from specified columns. Implements SQL's `SELECT DISTINCT` functionality.

#### Signature
```javascript
distinct(...columns: string[]): Builder
```

#### Syntax
```javascript
model.fromTable(table).select().distinct(...columns)
```

#### Examples

**Single Column:**
```javascript
const uniqueEmails = await model
  .fromTable('users')
  .select()
  .distinct('email')

// SQL: SELECT DISTINCT email FROM users
```

**Multiple Columns:**
```javascript
const uniqueCombos = await model
  .fromTable('orders')
  .select()
  .distinct('customer_id', 'product_id')

// SQL: SELECT DISTINCT customer_id, product_id FROM orders
```

**With WHERE Clause:**
```javascript
const activeDepartments = await model
  .fromTable('users')
  .select()
  .distinct('department')
  .where('status', '=', 'active')

// SQL: SELECT DISTINCT department FROM users WHERE status = 'active'
```

#### Rules
- Must be chained after `select()`
- Requires at least one column
- No empty, null, or undefined column names allowed
- Cannot be called without preceding `select()`

#### Common Use Cases
- Get unique email addresses
- List unique categories or tags
- Find distinct value combinations
- Remove duplicate rows from results

---

### 3. `in(list)` - New Field Operator

**Type:** New Method  
**Category:** Field Operators (after `whereField()`)  
**Breaking Change:** No ❌

#### What It Does

Checks if a field value is in a provided list. More readable alternative to `whereIn()` when used with `whereField()`.

#### Signature
```javascript
in(list: Array): Builder
```

#### Syntax
```javascript
model.fromTable(table).whereField(column).in(list)
```

#### Examples

**Basic Usage:**
```javascript
const posts = await model
  .fromTable('posts')
  .select('*')
  .whereField('author')
  .in(['John Doe', 'Jane Smith', 'Bob Wilson'])

// SQL: WHERE author IN ('John Doe', 'Jane Smith', 'Bob Wilson')
```

**In Complex Chains:**
```javascript
const users = await model
  .fromTable('users')
  .select('*')
  .whereField('role').in(['admin', 'moderator'])
  .or()
  .whereField('department').in(['IT', 'HR'])

// SQL: WHERE role IN ('admin', 'moderator') OR department IN ('IT', 'HR')
```

**With Groups:**
```javascript
const results = await model
  .fromTable('products')
  .select('*')
  .where('status', '=', 'active')
  .andGroup((builder) => {
    return builder
      .whereField('category').in(['Electronics', 'Computers'])
      .orWhere('featured', '=', true)
  })
```

#### Rules
- Must follow `whereField()`
- List must be a non-empty array
- Cannot be used as standalone method

#### Comparison with `whereIn()`

Both are valid - choose based on context and readability:

```javascript
// Traditional approach (still valid)
.whereIn('author', ['John', 'Jane'])

// New field-based approach (more readable in chains)
.whereField('author').in(['John', 'Jane'])
```

#### Common Use Cases
- Filter by multiple authors, categories, or IDs
- Complex queries with multiple IN conditions
- More readable alternative in long method chains

---

### 4. `notIn(list)` - New Field Operator

**Type:** New Method  
**Category:** Field Operators (after `whereField()`)  
**Breaking Change:** No ❌

#### What It Does

Checks if a field value is NOT in a provided list. More readable alternative to `whereNotIn()` when used with `whereField()`.

#### Signature
```javascript
notIn(list: Array): Builder
```

#### Syntax
```javascript
model.fromTable(table).whereField(column).notIn(list)
```

#### Examples

**Basic Usage:**
```javascript
const users = await model
  .fromTable('users')
  .select('*')
  .whereField('status')
  .notIn(['banned', 'deleted', 'suspended'])

// SQL: WHERE status NOT IN ('banned', 'deleted', 'suspended')
```

**Safe DELETE Operations:**
```javascript
const result = await model
  .fromTable('sessions')
  .delete()
  .whereField('user_id')
  .notIn([1, 2, 3]) // Protect admin user sessions

// SQL: DELETE FROM sessions WHERE user_id NOT IN (1, 2, 3)
```

**Complex Filtering:**
```javascript
const posts = await model
  .fromTable('posts')
  .select('*')
  .where('published', '=', true)
  .andWhere((builder) => {
    return builder
      .whereField('author').notIn(['spam_user1', 'spam_user2'])
  })
```

#### Rules
- Must follow `whereField()`
- List must be a non-empty array
- Cannot be used as standalone method

#### Comparison with `whereNotIn()`

Both are valid - choose based on context and readability:

```javascript
// Traditional approach (still valid)
.whereNotIn('status', ['banned', 'deleted'])

// New field-based approach (more readable in chains)
.whereField('status').notIn(['banned', 'deleted'])
```

#### Common Use Cases
- Exclude banned/deleted users
- Filter out specific categories
- Protect certain records from operations
- Complex exclusion logic

---

## 📊 API Growth Summary

| Aspect | Before | After | Change |
|--------|--------|-------|--------|
| **Total API Members** | 30 | 32 | +2 |
| **Query Methods** | 8 | 9 | +1 |
| **Field Operators** | 4 | 6 | +2 |
| **Enhanced Methods** | 0 | 1 | select() |

---

## 🔄 Migration Guide

### Good News: No Breaking Changes!

All existing code continues to work without modification. The new features are purely additive.

### Upgrading Your Code (Optional)

You can optionally enhance your code to use the new features:

#### Pattern 1: Getting Unique Values

**Before:**
```javascript
const users = await model.fromTable('users').select('email')
const uniqueEmails = [...new Set(users.map(u => u.email))]
```

**After:**
```javascript
const uniqueEmails = await model
  .fromTable('users')
  .select()
  .distinct('email')
```

#### Pattern 2: IN Conditions in Complex Chains

**Before:**
```javascript
const posts = await model
  .fromTable('posts')
  .select('*')
  .whereIn('author', ['John', 'Jane'])
```

**After (More Readable in Chains):**
```javascript
const posts = await model
  .fromTable('posts')
  .select('*')
  .whereField('author').in(['John', 'Jane'])
```

**Note:** Both patterns remain valid. Use whichever reads better in your context.

---

## 🎯 New Method Chaining Patterns

### Pattern 1: SELECT DISTINCT
```javascript
model.fromTable('users').select().distinct('email')
```

### Pattern 2: Field-Based IN
```javascript
model.fromTable('posts').select('*').whereField('author').in(['John', 'Jane'])
```

### Pattern 3: Field-Based NOT IN
```javascript
model.fromTable('users').select('*').whereField('status').notIn(['banned'])
```

### Pattern 4: Combined Usage
```javascript
model.fromTable('users')
  .select()
  .distinct('department', 'role')
  .whereField('status').notIn(['inactive', 'deleted'])
  .andWhere('created_at', '>', '2025-01-01')
```

---

## 📚 Documentation Updates

All documentation has been updated to reflect the new features:

- ✅ `CURRENT_API_SUMMARY.md` - Complete method documentation
- ✅ `QUICK_REFERENCE.md` - Quick examples and patterns
- ✅ `API_STRUCTURE.md` - Visual diagrams and flows
- ✅ `API_ALIGNMENT_REPORT.md` - Technical verification
- ✅ `API_ALIGNMENT_COMPLETE.md` - Executive summary
- ✅ `DOCUMENTATION_INDEX.md` - Navigation guide

---

## 🧪 Testing

All new features have been:
- ✅ Implemented and verified
- ✅ Tested with example code
- ✅ Documented with comprehensive examples
- ✅ Validated for edge cases
- ✅ Confirmed backward compatible

---

## 🔍 Complete whereField() Chain

With the new additions, here's the complete set of operators available after `whereField()`:

```javascript
whereField('column')
  .isNull()              // IS NULL
  .isNotNull()           // IS NOT NULL
  .isBetween(a, b)       // BETWEEN a AND b
  .isNotBetween(a, b)    // NOT BETWEEN a AND b
  .in([...])             // IN (...) ✨ NEW
  .notIn([...])          // NOT IN (...) ✨ NEW
```

---

## 💡 Best Practices

### When to Use `distinct()`
- ✅ When you need unique values from columns
- ✅ To remove duplicate rows efficiently at database level
- ❌ Avoid for large tables without WHERE conditions (performance)

### When to Use `whereField().in()`
- ✅ In complex chains with multiple conditions
- ✅ When readability is improved over `whereIn()`
- ✅ Both patterns are valid - use what reads better

### When to Use `whereField().notIn()`
- ✅ For exclusion filters
- ✅ To protect specific records
- ✅ In safe DELETE operations
- ✅ Both patterns are valid - use what reads better

---

## ⚠️ Important Notes

### Validation Rules

**`distinct()`:**
- ⚠️ Must follow `select()`
- ⚠️ Requires at least one column
- ⚠️ No empty/null/undefined columns allowed

**`in()` and `notIn()`:**
- ⚠️ Must follow `whereField()`
- ⚠️ List must be a non-empty array
- ⚠️ Cannot be used standalone

### Error Messages

The new methods include comprehensive error handling:

```javascript
// Error: distinct() without columns
.select().distinct() // ❌ Throws error

// Error: distinct() without select()
.fromTable('users').distinct('email') // ❌ Throws error

// Error: in() with empty array
.whereField('status').in([]) // ❌ Throws error

// Error: notIn() without whereField()
.notIn(['banned']) // ❌ Throws error
```

---

## 🎉 Summary

This update brings powerful new query building capabilities to miniORM:

- 🎯 **More expressive queries** with `distinct()`
- 📖 **Better readability** with field-based `in()` and `notIn()`
- 🔄 **Fully backward compatible** - existing code works unchanged
- 📚 **Comprehensive documentation** - all features fully documented
- ✅ **Production ready** - tested and verified

---

## 📞 Need Help?

- **Quick Reference:** See `QUICK_REFERENCE.md`
- **Complete API Docs:** See `CURRENT_API_SUMMARY.md`
- **Visual Diagrams:** See `API_STRUCTURE.md`
- **Technical Details:** See `API_ALIGNMENT_REPORT.md`

---

**Changelog Version:** 1.0  
**Last Updated:** 2025  
**Status:** Complete ✅  
**Breaking Changes:** None ❌  
**New Features:** 4 ✨

---

*Happy coding with the new features!* 🚀