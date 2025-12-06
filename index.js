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

// postsModel.setTable('posts')

console.log(
  '✅ Created 3 miniORM instances (all share the same connection pool)',
)
console.log('✅ Auto-closing behavior enabled - no manual cleanup required')

const PORT = process.env.PORT || 3000
const app = express()

app.use(express.json())

app.get('/', async (req, res) => {
  try {
    const results = await postsModel.fromTable('posts').selectAll()
    return res.json(results)
  } catch (error) {
    return res.status(400).json({ warning: error.message })
  }
})

// Posts endpoint
app.post('/posts', async (req, res) => {
  const { post_author, post_title, post_body, post_likes } = req.body
  try {
    const results = await postsModel
      .fromTable(`posts`)
      .insert({ post_author, post_title, post_body, post_likes })
    return res.status(201).json({ post_id: results.insertId })
  } catch (error) {
    res.status(400).send({ error: error.message })
  }
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
