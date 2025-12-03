# API Alignment Summary

This document summarizes the changes made to align the README documentation with the actual implementation of miniORM.

## Date
2024

## Overview
The README has been updated to accurately reflect all implemented APIs and remove references to non-existent methods.

---

## Changes Made

### 1. Added Documentation for Missing Methods

Two implemented methods were missing from the API Reference section:

#### `whereIsNull(column)` - Lines 257-276
- **Purpose**: Check for NULL values in a column
- **Implementation**: `Builder.js` lines 291-297
- **Usage**: Already used in `index.js` line 43
- **Documentation Added**:
  - Method signature and description
  - SQL output example: `WHERE deleted_at IS NULL`
  - Chaining behavior rules
  - Error conditions and messages
  - Code examples in Quick Start and Examples sections

#### `whereIsNotNull(column)` - Lines 278-296
- **Purpose**: Check for non-NULL values in a column
- **Implementation**: `Builder.js` lines 299-305
- **Usage**: Already used in `index.js` line 44
- **Documentation Added**:
  - Method signature and description
  - SQL output example: `WHERE email IS NOT NULL`
  - Chaining behavior rules
  - Error conditions and messages
  - Code examples in Quick Start and Examples sections

### 2. Updated Class Hierarchy Diagram

Added missing methods to the Architecture section (lines 753-754):
```
├── whereIsNull()
├── whereIsNotNull()
```

### 3. Removed References to Non-Existent Methods

#### In README.md (Line 183)
**Before:**
```
"For the current used operator IN, consider using corresponding method operator (whereIsNotNull(), whereIsNull(), whereIn(), whereNotIn(), whereBetween() and whereNotBetween()"
```

**After:**
```
"For the current used operator IN, consider using corresponding method operator (whereIsNotNull(), whereIsNull(), whereIn(), whereNotIn())"
```

#### In Builder.js (Line 194)
**Before:**
```javascript
throw new Error(
  `For the current used operator ${operator}, consider using corresponding method operator (whereIsNotNull(), whereIsNull(), whereIn(), whereNotIn(), whereBetween() and whereNotBetween()`,
)
```

**After:**
```javascript
throw new Error(
  `For the current used operator ${operator}, consider using corresponding method operator (whereIsNotNull(), whereIsNull(), whereIn(), whereNotIn())`,
)
```

**Reason**: `whereBetween()` and `whereNotBetween()` methods are not implemented in the codebase.

### 4. Added Comprehensive Examples

#### Quick Start Section (Lines 95-106)
Added two new examples demonstrating NULL checking:
```javascript
// Check for NULL values
const deletedUsers = await model
  .select('id', 'name')
  .whereIsNull('deleted_at')
  .done()

// Check for non-NULL values
const verifiedUsers = await model
  .select('id', 'email')
  .whereIsNotNull('email_verified_at')
  .done()
```

#### New "NULL Checking Queries" Section (Lines 507-546)
Added a dedicated section with multiple examples:
- Basic NULL and NOT NULL checks
- Combining NULL checks with other conditions using `and()`
- Using `andWhere()` for chaining
- Complex NULL checking with grouping methods

---

## Verified Implementation Details

### Method Signatures

#### `whereIsNull(column)`
```javascript
/** @param {string} column @returns {Builder} */
whereIsNull(column) {
  if (arguments.length < 1 || arguments.length > 1)
    throw new Error('"Column name" argument is the only one that is required!')
  return this.#nullOrNotNull(column, 'IS NULL')
}
```

#### `whereIsNotNull(column)`
```javascript
/** @param {string} column @returns {Builder} */
whereIsNotNull(column) {
  if (arguments.length < 1 || arguments.length > 1)
    throw new Error('"Column name" argument is the only one that is required!')
  return this.#nullOrNotNull(column, 'IS NOT NULL')
}
```

### Chaining Behavior
Both methods follow the same chaining rules as other WHERE methods:
- Can be used as the first WHERE condition
- When used after another WHERE condition, must be chained through:
  - `and()` or `or()` operators
  - `andWhere()` or `orWhere()` methods
  - `andGroup()` or `orGroup()` grouping methods

### Error Messages
1. **Invalid argument count**: `"'Column name' argument is the only one that is required!"`
2. **Invalid column type**: `"Column should be a string and not empty!"`
3. **Invalid chaining**: `"where() and whereIsNull() methods must be chained through and() or or() or use grouping methods!"`

---

## Complete API List (Now Documented)

### Core Methods
- ✅ `new miniORM(options?)`
- ✅ `setTable(tableName)`
- ✅ `done()`

### Query Building Methods
- ✅ `select(...columns)`
- ✅ `selectAll()`
- ✅ `where(column, operator, value)`
- ✅ `orWhere(column, operator, value)`
- ✅ `andWhere(column, operator, value)`
- ✅ `whereIn(column, list)`
- ✅ `whereNotIn(column, list)`
- ✅ `whereIsNull(column)` ← **NEWLY DOCUMENTED**
- ✅ `whereIsNotNull(column)` ← **NEWLY DOCUMENTED**
- ✅ `orGroup(callback)`
- ✅ `andGroup(callback)`
- ✅ `and()`
- ✅ `or()`

### Properties
- ✅ `state` (read-only)
- ✅ `table` (read-only)
- ✅ `operatorSignal` (read-only)

---

## Testing Recommendations

To ensure the documentation accurately reflects the implementation:

1. **Test NULL checking methods**:
   ```javascript
   const result = await model.selectAll().whereIsNull('deleted_at').done()
   const result2 = await model.selectAll().whereIsNotNull('email').done()
   ```

2. **Test chaining behavior**:
   ```javascript
   // Valid chaining
   const valid = await model
     .select('*')
     .where('status', '=', 'active')
     .and()
     .whereIsNull('deleted_at')
     .done()

   // Invalid chaining (should throw error)
   try {
     const invalid = await model
       .select('*')
       .where('status', '=', 'active')
       .whereIsNull('deleted_at')  // Missing and()/or()
       .done()
   } catch (error) {
     console.log(error.message) // Expected error
   }
   ```

3. **Test error conditions**:
   ```javascript
   // Test invalid column type
   try {
     await model.selectAll().whereIsNull('').done()
   } catch (error) {
     console.log(error.message) // "Column should be a string and not empty!"
   }

   // Test invalid argument count
   try {
     await model.selectAll().whereIsNull('col1', 'col2').done()
   } catch (error) {
     console.log(error.message) // "'Column name' argument is the only one that is required!"
   }
   ```

---

## Files Modified

1. **miniORM/README.md**
   - Added `whereIsNull()` documentation (API Reference section)
   - Added `whereIsNotNull()` documentation (API Reference section)
   - Added NULL checking examples (Quick Start section)
   - Added "NULL Checking Queries" section with comprehensive examples
   - Updated Class Hierarchy diagram
   - Removed references to non-existent `whereBetween()` and `whereNotBetween()`

2. **miniORM/builder/Builder.js**
   - Removed references to non-existent `whereBetween()` and `whereNotBetween()` from error messages
   - Minor formatting improvements to `#group()` method

---

## Conclusion

The miniORM README now accurately reflects all implemented APIs. All methods documented in the API Reference section exist in the codebase, and all implemented methods are now properly documented with:

- Clear descriptions
- Usage examples
- SQL output examples
- Error conditions
- Chaining behavior rules

No methods are referenced in documentation that don't exist in the implementation, and no implemented methods lack documentation.