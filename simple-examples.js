import miniORM from './miniORM.js'
import debug from 'debug'

const exampleDebug = debug('examples:simple')

console.log('miniORM Simple Usage Examples')
console.log('============================\n')

// Create model instance
const model = new miniORM()
model.setTable('users')

// Example 1: Basic SELECT
async function example1_BasicSelect() {
  console.log('Example 1: Basic SELECT')
  console.log('-----------------------')

  try {
    // Select all users
    const allUsers = await model.selectAll().done()
    console.log('✅ SELECT * FROM users')
    exampleDebug('All users:', allUsers)

    // Select specific columns
    const specificColumns = await model
      .select('id', 'name', 'email')
      .done()
    console.log('✅ SELECT id, name, email FROM users')
    exampleDebug('Specific columns:', specificColumns)

  } catch (error) {
    console.error('❌ Error in basic select:', error.message)
  }

  console.log()
}

// Example 2: WHERE Conditions
async function example2_WhereConditions() {
  console.log('Example 2: WHERE Conditions')
  console.log('---------------------------')

  try {
    // Simple WHERE
    const activeUsers = await model
      .select('id', 'name')
      .where('status', '=', 'active')
      .done()
    console.log('✅ WHERE status = "active"')
    exampleDebug('Active users:', activeUsers)

    // AND condition using andWhere
    const activeAdmins = await model
      .select('id', 'name', 'role')
      .where('status', '=', 'active')
      .andWhere('role', '=', 'admin')
      .done()
    console.log('✅ WHERE status = "active" AND role = "admin"')
    exampleDebug('Active admins:', activeAdmins)

    // OR condition using orWhere
    const privilegedUsers = await model
      .select('id', 'name', 'role')
      .where('role', '=', 'admin')
      .orWhere('role', '=', 'moderator')
      .done()
    console.log('✅ WHERE role = "admin" OR role = "moderator"')
    exampleDebug('Privileged users:', privilegedUsers)

  } catch (error) {
    console.error('❌ Error in WHERE conditions:', error.message)
  }

  console.log()
}

// Example 3: IN/NOT IN Conditions
async function example3_InConditions() {
  console.log('Example 3: IN/NOT IN Conditions')
  console.log('-------------------------------')

  try {
    // WHERE IN
    const rolesIn = await model
      .select('id', 'name', 'role')
      .whereIn('role', ['admin', 'moderator', 'editor'])
      .done()
    console.log('✅ WHERE role IN ("admin", "moderator", "editor")')
    exampleDebug('Users with roles:', rolesIn)

    // WHERE NOT IN
    const activeUsers = await model
      .select('id', 'name', 'status')
      .whereNotIn('status', ['banned', 'deleted', 'suspended'])
      .done()
    console.log('✅ WHERE status NOT IN ("banned", "deleted", "suspended")')
    exampleDebug('Active users:', activeUsers)

  } catch (error) {
    console.error('❌ Error in IN conditions:', error.message)
  }

  console.log()
}

// Example 4: NULL Conditions
async function example4_NullConditions() {
  console.log('Example 4: NULL Conditions')
  console.log('--------------------------')

  try {
    // WHERE IS NULL
    const unverifiedUsers = await model
      .select('id', 'name', 'email')
      .whereIsNull('email_verified_at')
      .done()
    console.log('✅ WHERE email_verified_at IS NULL')
    exampleDebug('Unverified users:', unverifiedUsers)

    // WHERE IS NOT NULL
    const verifiedUsers = await model
      .select('id', 'name', 'email')
      .whereIsNotNull('email_verified_at')
      .done()
    console.log('✅ WHERE email_verified_at IS NOT NULL')
    exampleDebug('Verified users:', verifiedUsers)

  } catch (error) {
    console.error('❌ Error in NULL conditions:', error.message)
  }

  console.log()
}

// Example 5: Grouped Conditions
async function example5_GroupedConditions() {
  console.log('Example 5: Grouped Conditions')
  console.log('-----------------------------')

  try {
    // AND group
    const complexQuery = await model
      .select('id', 'name', 'role', 'department')
      .where('status', '=', 'active')
      .andGroup((builder) => {
        return builder
          .where('role', '=', 'admin')
          .orWhere('department', '=', 'IT')
      })
      .done()
    console.log('✅ WHERE status = "active" AND (role = "admin" OR department = "IT")')
    exampleDebug('Complex query result:', complexQuery)

    // Nested groups
    const nestedQuery = await model
      .select('id', 'name', 'role')
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
      .done()
    console.log('✅ Nested grouped conditions')
    exampleDebug('Nested query result:', nestedQuery)

  } catch (error) {
    console.error('❌ Error in grouped conditions:', error.message)
  }

  console.log()
}

// Example 6: UPDATE Operations
async function example6_UpdateOperations() {
  console.log('Example 6: UPDATE Operations')
  console.log('----------------------------')

  try {
    // Simple update
    const updateSingle = await model
      .update({
        last_login: new Date(),
        status: 'active'
      })
      .where('id', '=', 1)
      .done()
    console.log('✅ UPDATE users SET last_login = ?, status = ? WHERE id = 1')
    exampleDebug('Update single result:', updateSingle)

    // Bulk update with conditions
    const bulkUpdate = await model
      .update({
        status: 'verified',
        verified_at: new Date()
      })
      .where('email_verified', '=', true)
      .andWhere('status', '=', 'pending')
      .done()
    console.log('✅ Bulk update with multiple conditions')
    exampleDebug('Bulk update result:', bulkUpdate)

  } catch (error) {
    console.error('❌ Error in update operations:', error.message)
  }

  console.log()
}

// Example 7: Type Casting
async function example7_TypeCasting() {
  console.log('Example 7: Type Casting')
  console.log('-----------------------')

  try {
    // Cast string to number
    const ageFilter = await model
      .select('id', 'name', 'age')
      .where('age', '>', { value: '18', type: 'number' })
      .done()
    console.log('✅ Type casting: string "18" to number 18')
    exampleDebug('Age filter result:', ageFilter)

    // Cast to boolean
    const booleanFilter = await model
      .select('id', 'name', 'verified')
      .where('verified', '=', { value: 'true', type: 'boolean' })
      .done()
    console.log('✅ Type casting: string "true" to boolean true')
    exampleDebug('Boolean filter result:', booleanFilter)

  } catch (error) {
    console.error('❌ Error in type casting:', error.message)
  }

  console.log()
}

// Example 8: Query State Inspection
async function example8_QueryStateInspection() {
  console.log('Example 8: Query State Inspection')
  console.log('---------------------------------')

  try {
    // Build a query but don't execute it yet
    const query = model
      .select('id', 'name', 'email')
      .where('status', '=', 'active')
      .andWhere('role', '=', 'admin')
      .orGroup((builder) => {
        return builder
          .where('department', '=', 'IT')
          .andWhere('level', '>', 5)
      })

    // Inspect the query state
    console.log('✅ Query parts:', query.state.query)
    console.log('✅ Query values:', query.state.values)
    console.log('✅ Table name:', query.table)
    console.log('✅ Is operator:', query.operatorSignal)

    // Now execute it
    const results = await query.done()
    exampleDebug('Final query result:', results)

  } catch (error) {
    console.error('❌ Error in query inspection:', error.message)
  }

  console.log()
}

// Run all examples
async function runAllExamples() {
  console.log('🚀 Starting miniORM Simple Examples\n')

  await example1_BasicSelect()
  await example2_WhereConditions()
  await example3_InConditions()
  await example4_NullConditions()
  await example5_GroupedConditions()
  await example6_UpdateOperations()
  await example7_TypeCasting()
  await example8_QueryStateInspection()

  console.log('✅ All examples completed!')
  console.log('\n💡 To see debug output, run:')
  console.log('   DEBUG=examples:*,miniORM:* node simple-examples.js')
  console.log('\n🔌 Connection pool will close automatically when process exits')
}

// Export individual examples for testing
export {
  example1_BasicSelect,
  example2_WhereConditions,
  example3_InConditions,
  example4_NullConditions,
  example5_GroupedConditions,
  example6_UpdateOperations,
  example7_TypeCasting,
  example8_QueryStateInspection
}

// Run examples if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllExamples().catch(console.error)
}
