import mysql from 'mysql2/promise'
import debug from 'debug'

const dbDebug = debug('miniORM:db')
const optionsDebug = debug('miniORM:options')

/**
 * @type {mysql.Pool|null} pool
 */
let pool = null

/**
 * @type {Promise<mysql.Pool>|null} poolPromise
 */
let poolPromise = null

/**
 * Auto-cleanup handler for graceful shutdown
 * Ensures proper connection pool cleanup when the application exits
 */
const setupAutoCleanup = () => {
  const cleanup = async () => {
    if (pool) {
      try {
        dbDebug('Connection pool closing automatically on process exit')
        await pool.end()
        dbDebug('Connection pool closed automatically on process exit')
      } catch (error) {
        dbDebug(`Error during auto-cleanup: ${error.message}`)
      } finally {
        pool = null
        poolPromise = null
        dbDebug('Pool references reset to null')
      }
    }
  }

  // Register cleanup handlers for graceful shutdown
  process.on('SIGINT', cleanup)
  process.on('SIGTERM', cleanup)
  process.on('exit', cleanup)
}

/**
 * @param {mysql.PoolOptions} options
 * @return {Promise<mysql.Pool>}
 */
const dbConnection = async (options = {}) => {
  if (pool) return pool

  if (poolPromise) return poolPromise

  poolPromise = new Promise(async function (resolve, reject) {
    const DB_HOST = options.host || process.env.DB_HOST || 'localhost'
    const DB_USER = options.user || process.env.DB_USER || 'root'
    const DB_PASSWORD = options.password || process.env.DB_PASSWORD
    const DB_NAME = options.database || process.env.DB_NAME
    const DB_PORT = Number(options.port || process.env.DB_PORT || 3306)
    const CONNECTION_LIMIT = Number(
      options.connectionLimit || process.env.CONNECTION_LIMIT || 10,
    )

    /**
     * @type {mysql.PoolOptions} config
     * Auto-closing configuration enforced for all consumers
     */
    const config = {
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      port: DB_PORT,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: CONNECTION_LIMIT,
    }

    try {
      if (!DB_NAME || !DB_HOST || !DB_USER || DB_PASSWORD === '')
        throw new Error(
          'Missing essential DB config (HOST, USER, NAME, or a non-empty PASSWORD) in the .env or connection options.',
        )

      pool = mysql.createPool(config)

      // Setup auto-cleanup handlers (enforced for all consumers)
      setupAutoCleanup()

      optionsDebug('Config from passed via options object:')
      optionsDebug(options)

      optionsDebug('_________________________________________________________')

      optionsDebug('Config from .env file (auto-closing enforced):')
      optionsDebug(config)

      dbDebug('Connection pool created with auto-closing configuration')
      resolve(pool)
    } catch (error) {
      dbDebug(`Connection error : ${error.message}`)
      poolPromise = null
      reject(error)
    }
  })

  return poolPromise
}

export default dbConnection
