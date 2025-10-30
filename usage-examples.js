import express from 'express'
import miniORM from './miniORM.js'
import debug from 'debug'

const exampleDebug = debug('examples:usage')

// ========================================
// EXAMPLE 1: Simple Usage - Just call gracefulShutdown
// ========================================
console.log('\n=== EXAMPLE 1: Simple Usage ===')

function example1_SimpleUsage() {
  const app = express()

  app.get('/', async (req, res) => {
    const model = new miniORM()
    model.setTable('users')
    const users = await model.selectAll().done()
    res.json(users)
  })

  // Consumer just needs these three lines!
  process.on('SIGTERM', () => miniORM.gracefulShutdown('SIGTERM'))
  process.on('SIGINT', () => miniORM.gracefulShutdown('SIGINT'))
  process.on('SIGUSR2', () => miniORM.gracefulShutdown('SIGUSR2'))

  console.log('Example 1: Simple graceful shutdown setup complete')
}

// ========================================
// EXAMPLE 2: Even Simpler - Auto Setup
// ========================================
console.log('\n=== EXAMPLE 2: Auto Setup ===')

function example2_AutoSetup() {
  const app = express()

  app.get('/', async (req, res) => {
    const model = new miniORM()
    model.setTable('posts')
    const posts = await model.selectAll().done()
    res.json(posts)
  })

  // Consumer just needs ONE line!
  miniORM.setupGracefulShutdown()

  console.log('Example 2: Auto graceful shutdown setup complete')
}

// ========================================
// EXAMPLE 3: With Custom Pre/Post Shutdown Logic
// ========================================
console.log('\n=== EXAMPLE 3: Custom Shutdown Logic ===')

function example3_CustomLogic() {
  const app = express()
  let server

  app.get('/', async (req, res) => {
    const model = new miniORM()
    model.setTable('orders')
    const orders = await model.selectAll().done()
    res.json(orders)
  })

  // Custom pre-shutdown logic
  const beforeShutdown = async (signal) => {
    exampleDebug(`Custom pre-shutdown for ${signal}`)

    // Close HTTP server first
    if (server) {
      return new Promise((resolve) => {
        server.close(() => {
          exampleDebug('HTTP server closed')
          resolve()
        })
      })
    }
  }

  // Custom post-shutdown logic
  const afterShutdown = async (signal) => {
    exampleDebug(`Custom post-shutdown for ${signal}`)

    // Clear cache, send notifications, etc.
    await clearCache()
    await sendShutdownNotification(signal)
  }

  // Setup with custom callbacks
  miniORM.setupGracefulShutdown(beforeShutdown, afterShutdown)

  server = app.listen(3000, () => {
    console.log('Example 3: Server with custom shutdown logic started')
  })
}

// ========================================
// EXAMPLE 4: Manual Signal Setup with Custom Signals
// ========================================
console.log('\n=== EXAMPLE 4: Manual Custom Signals ===')

function example4_CustomSignals() {
  const app = express()

  app.get('/', async (req, res) => {
    const model = new miniORM()
    model.setTable('products')
    const products = await model.selectAll().done()
    res.json(products)
  })

  // Custom signals array
  const customSignals = ['SIGTERM', 'SIGINT', 'SIGHUP', 'SIGQUIT']

  // Setup with custom signals
  miniORM.setupGracefulShutdown(null, null, customSignals)

  console.log('Example 4: Custom signals setup complete')
}

// ========================================
// EXAMPLE 5: Mixed Approach - Some Auto, Some Manual
// ========================================
console.log('\n=== EXAMPLE 5: Mixed Approach ===')

function example5_MixedApproach() {
  const app = express()

  app.get('/', async (req, res) => {
    const model = new miniORM()
    model.setTable('analytics')
    const data = await model.selectAll().done()
    res.json(data)
  })

  // Auto setup for common signals
  miniORM.setupGracefulShutdown()

  // Manual setup for special cases
  process.on('SIGQUIT', async () => {
    console.log('SIGQUIT received - performing immediate shutdown')
    await miniORM.closeConnection() // Direct call, no graceful handling
    process.exit(0)
  })

  // Handle uncaught exceptions
  process.on('uncaughtException', async (error) => {
    console.error('Uncaught Exception:', error)
    await miniORM.gracefulShutdown('uncaughtException')
  })

  console.log('Example 5: Mixed approach setup complete')
}

// ========================================
// EXAMPLE 6: Enterprise Setup with Full Error Handling
// ========================================
console.log('\n=== EXAMPLE 6: Enterprise Setup ===')

function example6_EnterpriseSetup() {
  const app = express()
  let server

  app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() })
  })

  app.get('/users', async (req, res) => {
    try {
      const model = new miniORM()
      model.setTable('users')
      const users = await model.selectAll().done()
      res.json(users)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  })

  // Enterprise-grade shutdown handling
  const enterpriseBeforeShutdown = async (signal) => {
    exampleDebug(`Enterprise pre-shutdown started for ${signal}`)

    // Stop accepting new requests
    if (server) {
      server.close()
    }

    // Wait for active requests to complete (timeout after 10 seconds)
    await new Promise((resolve) => {
      setTimeout(resolve, 2000) // Grace period for active requests
    })

    // Log shutdown metrics
    console.log('Active connections closed, proceeding with database shutdown')
  }

  const enterpriseAfterShutdown = async (signal) => {
    exampleDebug(`Enterprise post-shutdown started for ${signal}`)

    // Send shutdown notification to monitoring systems
    console.log('Notifying monitoring systems of shutdown')

    // Clear any remaining cache
    console.log('Cache cleared')

    // Final log entry
    console.log(`Application shutdown completed for signal: ${signal}`)
  }

  // Setup enterprise graceful shutdown
  miniORM.setupGracefulShutdown(
    enterpriseBeforeShutdown,
    enterpriseAfterShutdown,
    ['SIGTERM', 'SIGINT', 'SIGUSR2', 'SIGHUP']
  )

  // Handle process errors
  process.on('uncaughtException', async (error) => {
    console.error('Uncaught Exception - Emergency shutdown:', error)
    await miniORM.gracefulShutdown('uncaughtException')
  })

  process.on('unhandledRejection', async (reason, promise) => {
    console.error('Unhandled Rejection - Emergency shutdown:', reason)
    await miniORM.gracefulShutdown('unhandledRejection')
  })

  server = app.listen(3000, () => {
    console.log('Example 6: Enterprise server started on port 3000')
  })
}

// ========================================
// Helper Functions
// ========================================

async function clearCache() {
  // Simulate cache clearing
  return new Promise((resolve) => {
    setTimeout(() => {
      exampleDebug('Cache cleared')
      resolve()
    }, 100)
  })
}

async function sendShutdownNotification(signal) {
  // Simulate notification sending
  return new Promise((resolve) => {
    setTimeout(() => {
      exampleDebug(`Shutdown notification sent for ${signal}`)
      resolve()
    }, 50)
  })
}

// ========================================
// Usage Instructions
// ========================================

console.log(`
======================================
USAGE EXAMPLES SUMMARY
======================================

1. Simple Usage (3 lines):
   process.on('SIGTERM', () => miniORM.gracefulShutdown('SIGTERM'))
   process.on('SIGINT', () => miniORM.gracefulShutdown('SIGINT'))
   process.on('SIGUSR2', () => miniORM.gracefulShutdown('SIGUSR2'))

2. Auto Setup (1 line):
   miniORM.setupGracefulShutdown()

3. With Custom Logic:
   miniORM.setupGracefulShutdown(beforeCallback, afterCallback)

4. Custom Signals:
   miniORM.setupGracefulShutdown(null, null, ['SIGTERM', 'SIGINT', 'SIGHUP'])

5. Manual Control:
   await miniORM.gracefulShutdown(signal, beforeFn, afterFn)

To run examples:
- DEBUG=examples:*,miniORM:* node usage-examples.js
- Press Ctrl+C to test graceful shutdown

Choose the pattern that best fits your application's needs!
`)

// Export examples for testing
export {
  example1_SimpleUsage,
  example2_AutoSetup,
  example3_CustomLogic,
  example4_CustomSignals,
  example5_MixedApproach,
  example6_EnterpriseSetup
}
