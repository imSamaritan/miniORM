# miniORM API Structure Diagram

Visual representation of the complete miniORM API structure and method relationships.

**Updated:** Now includes `distinct()`, `in()`, and `notIn()` methods!

---

## 🏗️ Class Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                         miniORM                              │
│                                                              │
│  extends Builder                                             │
│  ├── Execute (composition)                                   │
│  │   └── db.js (connection pool)                            │
│  └── Helper (utilities)                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Complete API Map

```
miniORM
│
├─ 🔧 CONSTRUCTOR
│  └─ new miniORM(options?)
│
├─ 📋 TABLE SELECTION
│  ├─ fromTable(tableName)        [Must be first]
│  └─ setTable(tableName)          [Internal use]
│
├─ ⚙️ QUERY EXECUTION
│  ├─ done()                       [Explicit execution]
│  └─ then(resolve, reject)        [Promise-like behavior]
│
├─ 📖 SELECT OPERATIONS
│  ├─ select(...columns)           ✨ [Now supports no args]
│  ├─ distinct(...columns)         ✨ [NEW - Must follow select()]
│  ├─ selectAll()
│  └─ countRecords()
│
├─ ✏️ MODIFICATION OPERATIONS
│  ├─ insert(details)
│  ├─ update(details)
│  └─ delete()
│
├─ 🔍 WHERE CLAUSE METHODS
│  ├─ where(column, operator, value)
│  ├─ andWhere(column, operator, value)
│  ├─ orWhere(column, operator, value)
│  ├─ whereIn(column, list)
│  ├─ whereNotIn(column, list)
│  └─ whereField(column) ───┐
│                            │
├─ 🎯 FIELD OPERATORS         │ [After whereField]
│  ├─ isNull() ◄─────────────┘
│  ├─ isNotNull()
│  ├─ isBetween(start, end)
│  ├─ isNotBetween(start, end)
│  ├─ in(list)                     ✨ [NEW]
│  └─ notIn(list)                  ✨ [NEW]
│
├─ 🔗 LOGICAL OPERATORS
│  ├─ and()
│  ├─ or()
│  ├─ andGroup(callback)
│  └─ orGroup(callback)
│
├─ 📄 PAGINATION
│  ├─ limit(number)
│  └─ offset(number)            [Must follow limit]
│
└─ 📊 PROPERTIES (Read-only)
   ├─ state                     [Returns {query, values}]
   ├─ table                     [Returns table name]
   └─ operatorSignal            [Returns boolean flag]
```

---

## 🔄 Method Chaining Flow

```
START
  │
  ├─► new miniORM(options?) ──► Create Instance
  │
  ├─► fromTable(table) ────────┐
  │   OR                        │
  └─► setTable(table) ──────────┤
                                │
  ┌───────────────────────────┘
  │
  ├─► SELECT PATH ─────────────┐
  │   ├─ select(...)            │
  │   │  └─ distinct(...) ✨    │ [NEW - Must follow select()]
  │   ├─ selectAll()            │
  │   └─ countRecords()         │
  │                             │
  ├─► INSERT PATH              │
  │   └─ insert(details) ───► done() ──► RESULT
  │                             │
  ├─► UPDATE PATH              │
  │   └─ update(details) ────► │
  │                             │
  ├─► DELETE PATH              │
  │   └─ delete() ─────────────┤
  │                             │
  └─────────────────────────────┤
                                │
  ┌───────────────────────────┘
  │
  ├─► WHERE CONDITIONS ─────────┐
  │   ├─ where(...)             │
  │   ├─ andWhere(...)          │
  │   ├─ orWhere(...)           │
  │   ├─ whereIn(...)           │
  │   ├─ whereNotIn(...)        │
  │   └─ whereField(...) ───┐   │
  │       ├─ isNull()       │   │
  │       ├─ isNotNull()    │   │
  │       ├─ isBetween()    │   │
  │       ├─ isNotBetween() │   │
  │       ├─ in(...) ✨     │   │ [NEW]
  │       └─ notIn(...) ✨  │   │ [NEW]
  │                         │   │
  ├─► LOGICAL OPERATORS     │   │
  │   ├─ and() ─────────────┤   │
  │   ├─ or() ──────────────┤   │
  │   ├─ andGroup(cb) ──────┤   │
  │   └─ orGroup(cb) ───────┤   │
  │                         │   │
  └─────────────────────────┴───┤
                                │
  ┌───────────────────────────┘
  │
  ├─► PAGINATION (Optional) ────┐
  │   ├─ limit(n)               │
  │   └─ offset(n)              │
  │                             │
  └─────────────────────────────┤
                                │
                         ┌──────┴──────┐
                         │             │
                      done()     or   await
                         │             │
                         └──────┬──────┘
                                │
                            ✅ RESULT
```

---

## 🎯 WHERE Operators Map

```
where(column, operator, value)
              │
              ├─ COMPARISON
              │  ├─ '='          Equal
              │  ├─ '!='         Not Equal
              │  ├─ '<>'         Not Equal (alt)
              │  ├─ '>'          Greater Than
              │  ├─ '>='         Greater or Equal
              │  ├─ '<'          Less Than
              │  └─ '<='         Less or Equal
              │
              └─ PATTERN
                 ├─ 'LIKE'      Pattern Match
                 └─ 'NOT LIKE'  Negative Match

whereIn(column, list)          IN array
whereNotIn(column, list)       NOT IN array

whereField(column)
  ├─ isNull()                  IS NULL
  ├─ isNotNull()               IS NOT NULL
  ├─ isBetween(a, b)           BETWEEN a AND b
  ├─ isNotBetween(a, b)        NOT BETWEEN a AND b
  ├─ in(list) ✨               IN (list) [NEW]
  └─ notIn(list) ✨            NOT IN (list) [NEW]
```

---

## ✨ NEW: distinct() Flow

```
select() with no arguments
    │
    ├─ Allows for flexible query building
    │
    └─► distinct(...columns)
            │
            ├─ Adds DISTINCT clause
            ├─ Requires at least 1 column
            └─ Filters duplicate rows
                │
                └─► SQL: SELECT DISTINCT column1, column2 FROM table
```

**Example:**
```javascript
model.fromTable('users').select().distinct('email')
// SQL: SELECT DISTINCT email FROM users
```

---

## ✨ NEW: Field-Based in()/notIn() Flow

```
whereField(column)
    │
    ├─► in(list)
    │    │
    │    ├─ Validates list is non-empty array
    │    ├─ Creates placeholders (?, ?, ?)
    │    └─► SQL: column IN (?, ?, ?)
    │
    └─► notIn(list)
         │
         ├─ Validates list is non-empty array
         ├─ Creates placeholders (?, ?, ?)
         └─► SQL: column NOT IN (?, ?, ?)
```

**Example:**
```javascript
model.fromTable('posts')
  .select('*')
  .whereField('author').in(['John', 'Jane', 'Bob'])
// SQL: WHERE author IN ('John', 'Jane', 'Bob')
```

---

## 🔄 Immutable Builder Pattern

```
const base = model.fromTable('users')
      │
      ├─ select('id', 'name') ──► query1 (new instance)
      │
      ├─ select().distinct('email') ──► query2 (new instance) ✨
      │
      └─ selectAll() ────────────► query3 (new instance)

base ──► UNCHANGED (immutable)

Each method returns a NEW instance
Original instance preserved
```

---

## 🔌 Connection Pool Architecture

```
┌────────────────────────────────────────────────┐
│          Application Layer                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │miniORM #1│  │miniORM #2│  │miniORM #3│    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
│       │             │             │            │
└───────┼─────────────┼─────────────┼────────────┘
        │             │             │
        └─────────────┴─────────────┘
                      │
        ┌─────────────▼─────────────┐
        │   SINGLETON CONNECTION     │
        │         POOL               │
        │   (mysql2/promise)         │
        │                            │
        │  ┌──┐ ┌──┐ ┌──┐ ┌──┐     │
        │  │C1│ │C2│ │C3│ │C4│ ... │
        │  └──┘ └──┘ └──┘ └──┘     │
        └────────────┬───────────────┘
                     │
        ┌────────────▼───────────────┐
        │      MySQL Database        │
        └────────────────────────────┘

Features:
✅ Single shared pool
✅ Auto cleanup on exit
✅ No manual close needed
```

---

## 📦 Type Casting Flow

```
value parameter
      │
      ├─ STRING ────────────────► Used as-is
      │
      ├─ NUMBER ────────────────► Used as-is
      │
      ├─ BOOLEAN ───────────────► Used as-is
      │
      └─ OBJECT
         {value: '...', type: '...'}
                │
                ├─ type: 'string' ──► toString()
                ├─ type: 'number' ──► Number() + validate
                └─ type: 'boolean' ─► Boolean()
                         │
                         └─► Casted value used in query
```

---

## 🎨 Grouped Conditions Structure

```
andGroup(callback)  /  orGroup(callback)
         │
         └─► Callback receives builder
                    │
                    ├─ where(...)
                    ├─ andWhere(...)
                    ├─ orWhere(...)
                    ├─ whereField(...) ✨
                    │  ├─ in([...]) ✨
                    │  └─ notIn([...]) ✨
                    └─ Nested groups
                       ├─ andGroup(...)
                       └─ orGroup(...)

Example SQL Output:
WHERE status = 'active' AND (role IN ('admin', 'moderator') OR dept = 'IT')
                           └─────────────────────────────────────────────┘
                                        Group created here
```

---

## 🔍 Query State Object

```
query.state
    │
    ├─ query: []        Array of SQL fragments
    │   │
    │   ├─ ['SELECT']
    │   ├─ ['DISTINCT email FROM users'] ✨
    │   ├─ ['WHERE status IN(?,?,?)'] ✨
    │   └─ ['LIMIT ?']
    │
    └─ values: []       Array of parameter values
        │
        ├─ ['active', 'pending', 'verified']
        └─ [10]

Combined at execution:
SQL: query.join(' ') + ';'
Values: [...values]
```

---

## ⚡ Execution Flow

```
Query Building Phase
    │
    ├─ Method chaining
    │  └─ Each returns new instance
    │
    ├─ State accumulation
    │  └─ {query: [...], values: [...]}
    │
    └─ Validation
       └─ Check chaining rules
          │
          ▼
Execution Phase (done() or await)
    │
    ├─ Build final SQL
    │  └─ query.join(' ') + ';'
    │
    ├─ Get connection from pool
    │  └─ pool.execute(sql, values)
    │
    └─ Return results
       ├─ SELECT → rows array
       ├─ SELECT DISTINCT → unique rows ✨
       ├─ INSERT → {insertId, ...}
       ├─ UPDATE → {affectedRows, ...}
       └─ DELETE → {affectedRows, ...}
```

---

## 🛡️ Error Handling Points

```
Constructor
  └─ Validate options

fromTable/setTable
  └─ Must be first or fail

select
  ├─ If args provided, validate columns
  └─ No empty/null/undefined allowed

distinct ✨ NEW
  ├─ Requires at least 1 column
  ├─ No empty/null/undefined allowed
  └─ Must follow select()

selectAll
  └─ No arguments allowed

insert/update
  ├─ Must take object
  ├─ Cannot be empty
  └─ Cannot follow other methods

delete
  └─ Position validation

where
  ├─ 3 args required
  ├─ Valid operator
  ├─ Valid column
  └─ Valid value

andWhere/orWhere
  ├─ Must follow where
  └─ Cannot follow and()/or()

whereIn/whereNotIn
  ├─ Valid column
  └─ Valid array

whereField
  └─ Valid column string

in/notIn ✨ NEW
  ├─ Must be non-empty array
  └─ Must follow whereField()

isBetween/isNotBetween
  └─ Both args must be numbers

limit
  ├─ Must be number
  └─ Cannot be first

offset
  ├─ Must be number
  └─ Must follow limit

done()
  └─ Cannot end with AND/OR
```

---

## 📋 Method Categories

```
🎯 INITIALIZATION (2)
   ├─ new miniORM()
   └─ fromTable() / setTable()

📖 READ (4)
   ├─ select()        ✨ [Updated: supports no args]
   ├─ distinct()      ✨ [NEW]
   ├─ selectAll()
   └─ countRecords()

✏️ WRITE (3)
   ├─ insert()
   ├─ update()
   └─ delete()

🔍 FILTERING (6)
   ├─ where()
   ├─ andWhere()
   ├─ orWhere()
   ├─ whereIn()
   ├─ whereNotIn()
   └─ whereField()

🎯 FIELD OPS (6)
   ├─ isNull()
   ├─ isNotNull()
   ├─ isBetween()
   ├─ isNotBetween()
   ├─ in()            ✨ [NEW]
   └─ notIn()         ✨ [NEW]

🔗 LOGIC (4)
   ├─ and()
   ├─ or()
   ├─ andGroup()
   └─ orGroup()

📄 PAGINATION (2)
   ├─ limit()
   └─ offset()

⚙️ EXECUTION (2)
   ├─ done()
   └─ then()

📊 INSPECTION (3)
   ├─ state
   ├─ table
   └─ operatorSignal

Total: 32 API members (30 + 2 new field operators)
```

---

## 🌊 Data Flow Diagram

```
User Code
    │
    ├─► miniORM Instance
    │       │
    │       ├─► Builder (query construction)
    │       │       │
    │       │       ├─► State Management
    │       │       │   └─ {query: [], values: []}
    │       │       │
    │       │       ├─► New Methods ✨
    │       │       │   ├─ distinct() validation
    │       │       │   ├─ in() validation
    │       │       │   └─ notIn() validation
    │       │       │
    │       │       └─► Validation
    │       │           └─ Check rules & throw errors
    │       │
    │       └─► Execute (query execution)
    │               │
    │               ├─► Connection Pool
    │               │   │
    │               │   └─► MySQL Database
    │               │           │
    │               │           └─► Raw Results
    │               │
    │               └─► Return formatted results
    │
    └─► Results back to user
```

---

## 🎓 Usage Pattern Matrix

```
Operation    │ Method(s)              │ Requires WHERE │ Returns
─────────────┼────────────────────────┼────────────────┼──────────────
Select All   │ selectAll()            │ No             │ Rows[]
Select Some  │ select(...)            │ No             │ Rows[]
Select None  │ select() ✨            │ No             │ Partial query
Distinct     │ select().distinct() ✨ │ No             │ Unique rows[]
Count        │ countRecords()         │ No             │ {count: n}
Insert       │ insert({...})          │ No             │ {insertId}
Update All   │ update({...})          │ No*            │ {affectedRows}
Update Some  │ update({...}).where()  │ Yes            │ {affectedRows}
Delete All   │ delete()               │ No*            │ {affectedRows}
Delete Some  │ delete().where()       │ Yes            │ {affectedRows}
Filter In    │ whereField().in() ✨   │ After WHERE    │ Filtered rows

* Allowed but dangerous
```

---

## 🔐 Configuration Priority

```
1. Constructor Options (Highest Priority)
   new miniORM({host: 'custom', ...})
        │
        ▼
2. Environment Variables
   process.env.DB_HOST, etc.
        │
        ▼
3. Default Values (Lowest Priority)
   'localhost', 'root', etc.
```

---

## 🐛 Debug Namespace Structure

```
DEBUG=miniORM:*
        │
        ├─► miniORM:query
        │   └─ SQL queries and values
        │
        ├─► miniORM:db
        │   └─ Connection events
        │
        └─► miniORM:options
            └─ Configuration details
```

---

## 📊 API Complexity Levels

```
🟢 BEGINNER (Simple Operations)
   ├─ selectAll()
   ├─ select(...)
   ├─ select().distinct(...) ✨
   ├─ where(...).done()
   └─ insert({...})

🟡 INTERMEDIATE (Multiple Conditions)
   ├─ where().andWhere().orWhere()
   ├─ whereIn() / whereNotIn()
   ├─ whereField().isNull()
   ├─ whereField().in() / .notIn() ✨
   └─ update().where()

🟠 ADVANCED (Complex Queries)
   ├─ andGroup() / orGroup()
   ├─ Nested groups
   ├─ Type casting
   ├─ Dynamic query building
   └─ whereField() chains with multiple operators ✨

🔴 EXPERT (Architecture Understanding)
   ├─ Immutable pattern usage
   ├─ State inspection
   ├─ Connection pool management
   └─ Debug mode optimization
```

---

## ✨ New Features Visual Guide

### 1. distinct() Pattern

```
Traditional approach:
model.fromTable('users').select('email')
  → Returns all emails (including duplicates)

New approach: ✨
model.fromTable('users').select().distinct('email')
  → Returns unique emails only
```

### 2. Field-Based in()/notIn() Pattern

```
Traditional approach:
model.fromTable('posts')
  .select('*')
  .whereIn('author', ['John', 'Jane'])

New approach: ✨
model.fromTable('posts')
  .select('*')
  .whereField('author').in(['John', 'Jane'])
  
Both valid! Choose what reads better in your context.
```

### 3. Combined Usage

```
model.fromTable('users')
  .select()
  .distinct('role', 'department')
  .whereField('status').in(['active', 'pending'])
  .or()
  .whereField('priority').isBetween(1, 5)
  
SQL: SELECT DISTINCT role, department FROM users 
     WHERE status IN ('active', 'pending') 
     OR priority BETWEEN 1 AND 5
```

---

## ✅ Complete API Summary

```
Total API Surface: 32 members (+2 from previous version)

├─ Methods: 29
│  ├─ Query Building: 9 (+1 distinct)
│  ├─ WHERE Conditions: 6
│  ├─ Field Operators: 6 (+2 in/notIn)
│  ├─ Logical Operators: 4
│  ├─ Pagination: 2
│  ├─ Execution: 2
│  └─ Core: 1
│
└─ Properties: 3 (read-only)

All verified ✅
All documented ✅
All working ✅
```

---

## 🎯 Quick Method Reference

```
SELECT Operations:
  select()              → SELECT columns (or no args)
  select().distinct()   → SELECT DISTINCT (new!)
  selectAll()           → SELECT *
  countRecords()        → COUNT(*)

WHERE with IN:
  Option 1: whereIn('col', [])
  Option 2: whereField('col').in([])      (new!)
  Option 3: whereField('col').notIn([])   (new!)

Complete whereField() Chain:
  whereField('column')
    .isNull()
    .isNotNull()
    .isBetween(a, b)
    .isNotBetween(a, b)
    .in([...])        ← NEW
    .notIn([...])     ← NEW
```

---

**END OF API STRUCTURE DIAGRAM**

*Updated: 2025 - Now includes distinct(), in(), and notIn() methods*
*Total API Members: 32*
*All methods verified and documented ✅*