import express from 'express'
import dotenv from '@dotenvx/dotenvx'
import miniORM from './miniORM.js'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000
let server

// Disable auto shutdown - we want full manual control
miniORM.setAutoShutdown(false)

console.log('🔧 Auto shutdown disabled - manual control enabled')

app.get('/', async (req, res) => {
  try {
    const model = new miniORM()
    model.setTable('posts')

    const results = await model
      .select('post_id', 'post_title', 'post_body')
      .where({ post_author: 'imsamaritan' })
      .done()

    res.json(results)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/users', async (req, res) => {
  try {
    const model = new miniORM()
    model.setTable('users')

    const results = await model
      .select('id', 'name', 'email')
      .where({ status: 'active' })
      .done()

    res.json(results)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Custom shutdown handler with full control
const customShutdown = async (signal) => {
  console.log(`\n🛑 ${signal} received - starting custom shutdown sequence...`)

  // Step 1: Stop accepting new connections
  console.log('📡 Closing HTTP server...')
  if (server) {
    server.close(() => {
      console.log('✅ HTTP server closed')
    })
  }

  // Step 2: Wait for active requests to finish
  console.log('⏳ Waiting for active requests to complete...')
  await new Promise(resolve => setTimeout(resolve, 2000))

  // Step 3: Close database connections
  console.log('🗄️  Closing database connections...')
  try {
    await miniORM.closeConnection()
    console.log('✅ Database connections closed')
  } catch (error) {
    console.error('❌ Error closing database:', error.message)
  }

  // Step 4: Custom cleanup logic
  console.log('🧹 Running custom cleanup...')
  await performCustomCleanup()

  // Step 5: Final logging and exit
  console.log('🎯 Custom shutdown sequence completed')
  process.exit(0)
}

// Manual signal handling - we have full control
process.on('SIGTERM', () => customShutdown('SIGTERM'))
process.on('SIGINT', () => customShutdown('SIGINT'))
process.on('SIGUSR2', () => customShutdown('SIGUSR2')) // Nodemon restart

// Handle specific signals differently
process.on('SIGHUP', async () => {
  console.log('\n🔄 SIGHUP received - performing configuration reload...')
  // Custom logic for config reload instead of shutdown
  console.log('✅ Configuration reloaded (simulated)')
})

// Custom error handling
process.on('uncaughtException', async (error) => {
  console.error('\n💥 Uncaught Exception:', error)
  console.log('🚨 Emergency shutdown initiated...')

  try {
    await miniORM.closeConnection()
    console.log('✅ Emergency database cleanup completed')
  } catch (closeError) {
    console.error('❌ Error during emergency cleanup:', closeError.message)
  }

  process.exit(1)
})

process.on('unhandledRejection', async (reason, promise) => {
  console.error('\n💥 Unhandled Promise Rejection:', reason)
  console.log('🚨 Emergency shutdown initiated...')

  try {
    await miniORM.closeConnection()
    console.log('✅ Emergency database cleanup completed')
  } catch (closeError) {
    console.error('❌ Error during emergency cleanup:', closeError.message)
  }

  process.exit(1)
})

// Custom cleanup function
async function performCustomCleanup() {
  // Simulate custom cleanup tasks
  await new Promise(resolve => {
    setTimeout(() => {
      console.log('  • Cache cleared')
      console.log('  • Temporary files removed')
      console.log('  • Background jobs stopped')
      console.log('  • Metrics flushed')
      resolve()
    }, 500)
  })
}

// Start the server
server = app.listen(PORT, () => {
  console.log(`🚀 Manual Control Server started on port ${PORT}`)
  console.log('')
  console.log('📊 Available endpoints:')
  console.log('  GET / - Posts by specific author')
  console.log('  GET /users - Active users')
  console.log('')
  console.log('🎛️  Manual shutdown control enabled')
  console.log('📝 Signal behaviors:')
  console.log('  • SIGTERM/SIGINT/SIGUSR2: Graceful shutdown with custom sequence')
  console.log('  • SIGHUP: Configuration reload (no shutdown)')
  console.log('  • Uncaught errors: Emergency shutdown')
  console.log('')
  console.log('🧪 Test commands:')
  console.log('  • Ctrl+C: Graceful shutdown')
  console.log('  • kill -HUP <pid>: Config reload')
  console.log('  • kill -TERM <pid>: Graceful shutdown')
  console.log('')
  console.log('🐛 Debug: DEBUG=miniORM:* node manual-control-example.js')
})
