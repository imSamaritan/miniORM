const mysql = require('mysql2/promise')
const debug = require('debug')

const dbDebug = debug('minORM:db')
const optionsDebug = debug('miniORM:options')

/**
 * @type {mysql.Pool|null} pool
 */
let pool = null

/**
 * @type {mysql.Pool|null} poolPromise
 */
let poolPromise = null

/**
 * @param {mysql.PoolOptions} options
 * @return {mysql.Pool}
 */

const dbConnection = async (options = {}) => {
  if (pool) return pool

  if (poolPromise) return poolPromise

  poolPromise = new Promise(async function (resolve, reject) {
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
      if (!DB_NAME || !DB_HOST || !DB_USER || DB_PASSWORD === undefined)
        throw new Error(
          'Missing essential DB config (HOST, USER, PASSWORD, or NAME) in the .env or connection options.'
        )

      pool = mysql.createPool(config)

      optionsDebug('Config from passed via options object:')
      optionsDebug(options)

      optionsDebug('_________________________________________________________')

      optionsDebug('Config from .env file :')
      optionsDebug(config)

      resolve(pool)
    } catch (error) {
      dbDebug(`Connection error : ${error.message}`)
      poolPromise = null
      reject(error)
    }
  })

  return poolPromise
}

module.exports = dbConnection
