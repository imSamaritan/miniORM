import express from 'express'
import dotenv from '@dotenvx/dotenvx'
import miniORM from './miniORM.js'
import debug from 'debug'

dotenv.config()

const appDebug = debug('example:app')
const app = express()
const PORT = process.env.PORT || 3000

// User's application code - they control the process signals
class ExampleApp {
  constructor() {
    this.server = null
    this.setupRoutes()
    this.setupGracefulShutdown()
  }

  setupRoutes() {
    app.get('/', async (req, res) => {
      try {
        // Users create their own miniORM instances
        const model = new miniORM()
        model.setTable('posts')

        const results = await model
          .select('post_id', 'post_title', 'post_body')
          .where('post_author', '=', 'imsamaritan')
          .done()

        res.json(results)
      } catch (error) {
        appDebug(`Query error: ${error.message}`)
        res.status(500).json({ error: error.message })
      }
    })

    app.get('/all-posts', async (req, res) => {
      try {
        const model = new miniORM()
        model.setTable('posts')

        const results = await model.selectAll().done()
        res.json(results)
      } catch (error) {
        appDebug(`Query error: ${error.message}`)
        res.status(500).json({ error: error.message })
      }
    })
  }

  // USER is responsible for process signal handling
  setupGracefulShutdown() {
    const shutdown = async (signal) => {
      appDebug(`${signal} received. Starting graceful shutdown...`)

      // Close HTTP server first
      if (this.server) {
        this.server.close(() => {
          appDebug('HTTP server closed')
        })
      }

      // Connection pool closes automatically on process exit
      appDebug('Database connections will close automatically')
      appDebug('Graceful shutdown completed')
      process.exit(0)
    }

    // User controls when and how to handle signals
    process.on('SIGTERM', () => shutdown('SIGTERM'))
    process.on('SIGINT', () => shutdown('SIGINT'))
    process.on('SIGUSR2', () => shutdown('SIGUSR2')) // Nodemon restart

    // Optional: Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      appDebug('Uncaught Exception:', error)
      // Connection pool closes automatically on process exit
      process.exit(1)
    })

    process.on('unhandledRejection', (reason, promise) => {
      appDebug('Unhandled Rejection at:', promise, 'reason:', reason)
      // Connection pool closes automatically on process exit
      process.exit(1)
    })
  }

  start() {
    this.server = app.listen(PORT, () => {
      console.log(`Example app listening on port ${PORT}`)
      appDebug(`Server started on port ${PORT}`)
      appDebug('Available routes:')
      appDebug('  GET / - Get posts by specific author')
      appDebug('  GET /all-posts - Get all posts')
      appDebug('')
      appDebug('To test graceful shutdown: Press Ctrl+C')
      appDebug(
        'To see debug output: DEBUG=example:*,miniORM:* node example-app.js',
      )
    })
  }
}

// Initialize and start the application
const exampleApp = new ExampleApp()
exampleApp.start()
