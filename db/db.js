const mysql = require('mysql2/promise')
const debug = require('debug')

const dbDebug = debug('minORM:db')
const optionsDebug = debug('miniORM:options')

/**
 * @type {mysql.Pool|null} pool
 */
let pool = null

/**
 * @param {mysql.PoolOptions} options
 * @return {mysql.Pool}
 */

const dbConnection = async (options) => {
  if (pool) return pool

  const DB_HOST = options.host || process.env.DB_HOST || 'localhost'
  const DB_USER = options.user || process.env.DB_USER || 'root'
  const DB_PASSWORD = options.password || process.env.DB_PASSWORD || ''
  const DB_NAME = options.database || process.env.DB_NAME
  const DB_PORT = Number(options.port || process.env.DB_PORT || 3306)
  const CONNECTION_LIMIT = Number(
    options.connectionLimit || process.env.CONNECTION_LIMIT || 10
  )

  /**
   * @type {mysql.PoolOptions} config
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
    if (!DB_NAME)
      throw new Error(
        'Missing DB_NAME config in the .env or connection options {database: null}'
      )

    pool = mysql.createPool(config)
  } catch (error) {
    dbDebug(`Connection error : ${error.message}`)
    throw error
  }

  optionsDebug('Config from passed via options object:')
  optionsDebug(options)

  optionsDebug('_________________________________________________________')

  optionsDebug('Config from .env file :')
  optionsDebug(config)

  return pool
}

module.exports = dbConnection
