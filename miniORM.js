import Builder from './builder/builder.js'
import mysql from 'mysql2/promise'
import debug from 'debug'
import Execute from './execute/execute.js'
import { closeConnection } from './db/db.js'

const queryDebugger = debug('miniORM:query')
const shutdownDebug = debug('miniORM:shutdown')

// Auto shutdown configuration
let autoShutdownEnabled = true
let shutdownHandlersSetup = false

class miniORM extends Builder {
  #options
  #state
  #isOperator
  #executeMethod
  #execute
  #table

  /**
   * @param {{query: string[], values: (number|string)[]}} state
   * @param {boolean} isOperator
   * @param {string} executeMethod
   */
  constructor(
    options = {},
    state = { query: [], values: [] },
    isOperator = false,
    executeMethod = 'all',
  ) {
    super()
    this.#options = options
    this.#state = state
    this.#isOperator = isOperator
    this.#executeMethod = executeMethod

    if (options) this.#execute = new Execute(options)
    else this.#execute = new Execute()

    // Auto setup graceful shutdown on first instance creation
    this.#setupAutoShutdown()
  }

  /**
   * @param {{query: string[], values: (number|string)[]}} state
   * @param {boolean} isOperator
   * @param {string} executeMethod
   *
   * @return {miniORM}
   */
  clone(
    state,
    isOperator = this.#isOperator,
    executeMethod = this.#executeMethod,
  ) {
    const instance = new this.constructor(
      this.#options,
      state,
      isOperator,
      executeMethod,
    )
    instance.setTable(this.#table)
    instance.#execute = this.#execute
    return instance
  }

  /**
   * @param {string} table
   * @return {void}
   */
  setTable(table) {
    this.#table = table
  }

  /*** @return {string}*/
  get table() {
    return this.#table
  }

  /*** @return {{query: string[], values: (number|string)[]}}*/
  get state() {
    return this.#state
  }

  get operatorSignal() {
    return this.#isOperator
  }

  /**@return {Promise<mysql.QueryResult>} */
  async done() {
    const { query, values } = this.#state
    const method = this.#executeMethod
    const sql = query.join(' ') + ';'
    const queryLastPart = query[query.length - 1]

    if (queryLastPart === 'AND' || queryLastPart === 'OR') {
      throw new Error(
        `SQL query can not end with a logical operator [${queryLastPart}]`,
      )
    }

    queryDebugger(this.#state)

    return await this.#execute[method](sql, values)
  }

  /**
   * Static method to close all database connections
   * Should be called during application shutdown
   * @return {Promise<void>}
   */
  static async closeConnection() {
    return await closeConnection()
  }

  /**
   * Enable or disable auto shutdown functionality
   * @param {boolean} enabled - Whether to enable auto shutdown
   * @return {void}
   */
  static setAutoShutdown(enabled = true) {
    autoShutdownEnabled = enabled
    shutdownDebug(`Auto shutdown ${enabled ? 'enabled' : 'disabled'}`)

    if (enabled && !shutdownHandlersSetup) {
      miniORM.#setupGlobalShutdownHandlers()
    }
  }

  /**
   * Setup auto shutdown handlers (called internally)
   * @return {void}
   */
  static #setupGlobalShutdownHandlers() {
    if (shutdownHandlersSetup) return

    shutdownDebug('Setting up auto shutdown handlers...')

    const signals = ['SIGTERM', 'SIGINT', 'SIGUSR2']

    signals.forEach((signal) => {
      process.on(signal, () => {
        shutdownDebug(`Auto shutdown: ${signal} received`)
        miniORM.gracefulShutdown(signal)
      })
    })

    // Handle uncaught exceptions and rejections
    process.on('uncaughtException', async (error) => {
      console.error('Uncaught Exception - Auto shutdown:', error)
      await miniORM.gracefulShutdown('uncaughtException')
    })

    process.on('unhandledRejection', async (reason) => {
      console.error('Unhandled Rejection - Auto shutdown:', reason)
      await miniORM.gracefulShutdown('unhandledRejection')
    })

    shutdownHandlersSetup = true
    shutdownDebug('Auto shutdown handlers registered successfully')
  }

  /**
   * Setup auto shutdown on instance creation (internal method)
   * @return {void}
   */
  #setupAutoShutdown() {
    if (autoShutdownEnabled && !shutdownHandlersSetup) {
      shutdownDebug('Auto shutdown triggered by first miniORM instance')
      miniORM.#setupGlobalShutdownHandlers()
    }
  }

  /**
   * Utility method for graceful shutdown handling
   * Provides a ready-to-use shutdown function for consumers
   * @param {string} signal - The signal received (SIGTERM, SIGINT, etc.)
   * @param {Function} [beforeShutdown] - Optional callback to run before closing connections
   * @param {Function} [afterShutdown] - Optional callback to run after closing connections
   * @return {Promise<void>}
   */
  static async gracefulShutdown(signal, beforeShutdown, afterShutdown) {
    try {
      shutdownDebug(`${signal} received. Starting graceful shutdown...`)

      // Run user's pre-shutdown logic if provided
      if (beforeShutdown && typeof beforeShutdown === 'function') {
        shutdownDebug('Running pre-shutdown callback...')
        await beforeShutdown(signal)
        shutdownDebug('Pre-shutdown callback completed')
      }

      // Close database connections
      shutdownDebug('Closing database connections...')
      await closeConnection()
      shutdownDebug('Database connections closed successfully')

      // Run user's post-shutdown logic if provided
      if (afterShutdown && typeof afterShutdown === 'function') {
        shutdownDebug('Running post-shutdown callback...')
        await afterShutdown(signal)
        shutdownDebug('Post-shutdown callback completed')
      }

      shutdownDebug('Graceful shutdown completed')
      process.exit(0)
    } catch (error) {
      shutdownDebug(`Error during graceful shutdown: ${error.message}`)
      console.error('Shutdown error:', error)
      process.exit(1)
    }
  }

  /**
   * Manual setup of graceful shutdown handlers (overrides auto shutdown)
   * Use this when you want custom callbacks or specific signals
   * @param {Function} [beforeShutdown] - Optional callback to run before closing connections
   * @param {Function} [afterShutdown] - Optional callback to run after closing connections
   * @param {string[]} [signals] - Array of signals to listen for (defaults to common ones)
   * @return {void}
   */
  static setupGracefulShutdown(
    beforeShutdown,
    afterShutdown,
    signals = ['SIGTERM', 'SIGINT', 'SIGUSR2'],
  ) {
    // Disable auto shutdown since user wants manual control
    if (autoShutdownEnabled) {
      shutdownDebug(
        'Manual setupGracefulShutdown called - disabling auto shutdown',
      )
      autoShutdownEnabled = false
    }

    shutdownDebug(
      `Setting up manual graceful shutdown for signals: ${signals.join(', ')}`,
    )

    signals.forEach((signal) => {
      process.on(signal, () => {
        miniORM.gracefulShutdown(signal, beforeShutdown, afterShutdown)
      })
    })

    shutdownHandlersSetup = true
    shutdownDebug('Manual graceful shutdown handlers registered')
  }
}

// Export miniORM as default
export default miniORM
