import express from 'express'
import dotenv from '@dotenvx/dotenvx'
import miniORM from './miniORM.js'

dotenv.config()

/**
 * miniORM Auto-closing Demo Server
 *
 * This example demonstrates how miniORM automatically handles
 * connection pool lifecycle without requiring manual cleanup.
 *
 * Features demonstrated:
 * - Multiple model instances sharing the same connection pool
 * - Automatic cleanup on server shutdown (Ctrl+C)
 * - No manual .close() or .end() methods needed
 */

console.log('🚀 Starting miniORM Auto-closing Demo Server')
console.log('============================================')

// Create multiple instances to demonstrate shared pool
const postsModel = new miniORM()
const usersModel = new miniORM()
const categoriesModel = new miniORM()

postsModel.setTable('posts')
usersModel.setTable('users')
categoriesModel.setTable('categories')

console.log(
  '✅ Created 3 miniORM instances (all share the same connection pool)',
)
console.log('✅ Auto-closing behavior enabled - no manual cleanup required')

const PORT = process.env.PORT || 3000
const app = express()

// Posts endpoint
app.get('/', async (req, res) => {
  try {
    const results = await postsModel
      // .select('post_id', 'post_title', 'post_body')
      // .where({ post_author: 'imsamaritan' })
      .selectAll()
      .done()
    return res.send(results)
  } catch (error) {
    res.status(400).send({ error: error.message })
  }
})

// Users endpoint (demonstrates multiple models)
app.get('/users', async (req, res) => {
  try {
    const results = await usersModel
      .select('id', 'name', 'email')
      .where({ active: 1 })
      .done()
    return res.send(results)
  } catch (error) {
    res.status(400).send({ error: error.message })
  }
})

// Categories endpoint
app.get('/categories', async (req, res) => {
  try {
    const results = await categoriesModel
      .selectAll()
      .where({ parent_id: null })
      .done()
    return res.send(results)
  } catch (error) {
    res.status(400).send({ error: error.message })
  }
})

// Status endpoint to show connection info
app.get('/status', (req, res) => {
  res.json({
    message: 'miniORM Auto-closing Demo',
    features: {
      auto_closing: true,
      manual_closing: false,
      shared_pool: true,
      process_exit_cleanup: true,
    },
    endpoints: [
      'GET / - Posts by imsamaritan',
      'GET /users - Active users',
      'GET /categories - Top-level categories',
      'GET /status - This status page',
    ],
    note: 'Connection pool will automatically close when server shuts down',
  })
})

const server = app.listen(PORT, () => {
  console.log(`\n🌐 Server running on port ${PORT}`)
  console.log(`📊 Available endpoints:`)
  console.log(`   - http://localhost:${PORT}/ (posts)`)
  console.log(`   - http://localhost:${PORT}/users`)
  console.log(`   - http://localhost:${PORT}/categories`)
  console.log(`   - http://localhost:${PORT}/status`)
  console.log('\n💡 Try pressing Ctrl+C to see automatic cleanup in action!')
})

// Demonstrate graceful shutdown (auto-closing in action)
process.on('SIGINT', () => {
  console.log('\n\n🛑 Received shutdown signal (Ctrl+C)')
  console.log('🔄 Shutting down server gracefully...')

  server.close(() => {
    console.log('✅ HTTP server closed')
    console.log('🔌 Connection pool will close automatically...')
    console.log('👋 Goodbye!')
    // No need to manually close database connections - auto-closing handles it!
  })
})

process.on('SIGTERM', () => {
  console.log('\n\n🛑 Received SIGTERM signal')
  console.log('🔄 Shutting down server gracefully...')

  server.close(() => {
    console.log('✅ HTTP server closed')
    console.log('🔌 Connection pool cleanup handled automatically')
  })
})
