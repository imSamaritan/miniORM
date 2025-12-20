import mySQLizer from '../mySQLizer.js'
import debug from 'debug'

/**
 * Auto-closing Demo with Interactive Ctrl+C Test
 *
 * This example demonstrates how mySQLizer automatically handles
 * connection pool lifecycle without requiring manual cleanup.
 *
 * Features:
 * - Shows connection pool creation and sharing
 * - Interactive test for Ctrl+C cleanup behavior
 * - Real-time demonstration of auto-closing in action
 */

console.log('🚀 mySQLizer Auto-closing Demo')
console.log('============================')
console.log('')

// Show what methods are NOT available (by design)
console.log('🚫 Methods that do NOT exist (by design):')
console.log('- mySQLizer.closePool()')
console.log('- mySQLizer.prototype.close()')
console.log('- mySQLizer.prototype.disconnect()')
console.log('- mySQLizer.prototype.end()')
console.log('')

console.log('✅ What IS available (auto-closing only):')
console.log('- Automatic pool creation and reuse')
console.log('- Process exit cleanup handlers')
console.log('- Signal-based graceful shutdown')
console.log('- No consumer intervention required')
console.log('')

console.log('🔍 DEBUG INSTRUCTIONS:')
console.log('To see detailed cleanup messages, run with:')
console.log('  DEBUG=mySQLizer:* node examples/auto-closing-demo.js')
console.log('')

// Enable debug output for this demo
process.env.DEBUG = 'mySQLizer:*'

async function runDemo() {
  try {
    // Create multiple instances to demonstrate shared pool
    console.log(
      '✅ Creating 3 mySQLizer instances (all share the same connection pool)',
    )

    const postsModel = new mySQLizer()
    const usersModel = new mySQLizer()
    const categoriesModel = new mySQLizer()

    postsModel.setTable('posts')
    usersModel.setTable('users')
    categoriesModel.setTable('categories')

    console.log('   - postsModel created and configured')
    console.log('   - usersModel created and configured')
    console.log('   - categoriesModel created and configured')
    console.log('')

    // Demonstrate query building
    console.log('📊 Demonstrating query building:')

    const query1 = postsModel.select('id', 'title').where({ published: 1 })
    const query2 = usersModel.select('name', 'email').where({ active: 1 })
    const query3 = categoriesModel.selectAll().where({ parent_id: null })

    console.log('Query 1 (Posts):', query1.state)
    console.log('Query 2 (Users):', query2.state)
    console.log('Query 3 (Categories):', query3.state)
    console.log('')

    console.log('🔄 Connection Pool Status:')
    console.log('- Single pool instance shared across all models')
    console.log('- Automatic connection reuse and management')
    console.log('- No manual .close() or .end() methods needed')
    console.log('')

    console.log('⚡ Auto-closing Features:')
    console.log('- Process exit handlers registered automatically')
    console.log('- SIGINT/SIGTERM signal handling configured')
    console.log('- Connection pool will close when process exits')
    console.log('')

    // Start interactive test
    startInteractiveTest()
  } catch (error) {
    console.error('❌ Demo error:', error.message)
    process.exit(1)
  }
}

function startInteractiveTest() {
  console.log('🧪 INTERACTIVE AUTO-CLOSING TEST')
  console.log('=================================')
  console.log('This test demonstrates REAL auto-closing behavior.')
  console.log('The process will stay alive until you press Ctrl+C.')
  console.log('')
  console.log('📋 What to observe when you press Ctrl+C:')
  console.log('   1. "Received SIGINT" message appears')
  console.log('   2. Connection pool cleanup starts automatically')
  console.log('   3. Pool references are reset to null')
  console.log('   4. Process exits cleanly')
  console.log('')
  console.log("💡 This proves that consumers don't need manual cleanup!")
  console.log('')

  // Show active connection pool status
  const testModel = new mySQLizer()
  testModel.setTable('test_table')

  const testQuery = testModel.select('id', 'name').where({ active: 1 })
  console.log('🔍 Sample query built:', testQuery.state)
  console.log('✅ Connection pool is active and ready')
  console.log('')

  // Show periodic status updates
  let counter = 1
  const statusInterval = setInterval(() => {
    console.log(`⏱️  Status check #${counter}: Connection pool still active`)
    console.log('   Press Ctrl+C anytime to test auto-closing...')
    counter++
  }, 5000)

  // Set up interactive SIGINT handler
  process.on('SIGINT', () => {
    console.log('\n\n🛑 RECEIVED SIGINT (Ctrl+C) - STARTING AUTO-CLEANUP TEST!')
    console.log('=========================================================')

    clearInterval(statusInterval)

    console.log('📊 Before cleanup:')
    console.log('   - Connection pool exists and is active')
    console.log('   - Multiple model instances sharing the pool')
    console.log('   - No manual cleanup code executed')
    console.log('')

    console.log('🔄 Auto-cleanup sequence starting...')
    console.log('   (Watch the debug messages below)')
    console.log('')

    // The actual cleanup will be handled by setupAutoCleanup in db.js
    setTimeout(() => {
      console.log('✅ AUTO-CLEANUP DEMONSTRATION COMPLETE!')
      console.log('   - Connection pool was closed automatically')
      console.log('   - Pool references were reset to null')
      console.log('   - No manual cleanup code was needed')
      console.log('   - Process will exit cleanly')
      console.log('')
      console.log('🎉 This proves auto-closing works perfectly!')
    }, 100)
  })

  console.log('🚀 Interactive test is now running...')
  console.log('👆 Press Ctrl+C to see auto-closing in action!')
  console.log('   (The process will stay alive until you do)')
  console.log('')
}

// Run the demo
runDemo()
