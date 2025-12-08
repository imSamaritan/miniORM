# miniORM API Structure Diagram

Visual representation of the complete miniORM API structure and method relationships.

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
│  ├─ select(...columns)
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
│  └─ isNotBetween(start, end)
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
  │       └─ isNotBetween() │   │
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
  └─ isNotBetween(a, b)        NOT BETWEEN a AND b
```

---

## 🔄 Immutable Builder Pattern

```
const base = model.fromTable('users')
      │
      ├─ select('id', 'name') ──► query1 (new instance)
      │
      ├─ select('email') ────────► query2 (new instance)
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
                    └─ Nested groups
                       ├─ andGroup(...)
                       └─ orGroup(...)

Example SQL Output:
WHERE status = 'active' AND (role = 'admin' OR role = 'moderator')
                           └──────────────────────────────────┘
                                  Group created here
```

---

## 🔍 Query State Object

```
query.state
    │
    ├─ query: []        Array of SQL fragments
    │   │
    │   ├─ ['SELECT id, name FROM users']
    │   ├─ ['WHERE status = ?']
    │   ├─ ['AND role = ?']
    │   └─ ['LIMIT ?']
    │
    └─ values: []       Array of parameter values
        │
        ├─ ['active']
        ├─ ['admin']
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

select/selectAll
  └─ Validate columns

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

📖 READ (3)
   ├─ select()
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

🎯 FIELD OPS (4)
   ├─ isNull()
   ├─ isNotNull()
   ├─ isBetween()
   └─ isNotBetween()

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

Total: 30 API members
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
Count        │ countRecords()         │ No             │ {count: n}
Insert       │ insert({...})          │ No             │ {insertId}
Update All   │ update({...})          │ No*            │ {affectedRows}
Update Some  │ update({...}).where()  │ Yes            │ {affectedRows}
Delete All   │ delete()               │ No*            │ {affectedRows}
Delete Some  │ delete().where()       │ Yes            │ {affectedRows}

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
   ├─ where(...).done()
   └─ insert({...})

🟡 INTERMEDIATE (Multiple Conditions)
   ├─ where().andWhere().orWhere()
   ├─ whereIn() / whereNotIn()
   ├─ whereField().isNull()
   └─ update().where()

🟠 ADVANCED (Complex Queries)
   ├─ andGroup() / orGroup()
   ├─ Nested groups
   ├─ Type casting
   └─ Dynamic query building

🔴 EXPERT (Architecture Understanding)
   ├─ Immutable pattern usage
   ├─ State inspection
   ├─ Connection pool management
   └─ Debug mode optimization
```

---

## ✅ Complete API Summary

```
Total API Surface: 30 members

├─ Methods: 27
│  ├─ Query Building: 8
│  ├─ WHERE Conditions: 6
│  ├─ Field Operators: 4
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

**END OF API STRUCTURE DIAGRAM**