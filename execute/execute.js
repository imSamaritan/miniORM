const mysql = require('mysql2/promise')
const dbConnection = require('../db/db')

class Execute {
  /**
   * @type { mysql.PoolOptions } options
   */

  #options

  /**
   * @param { mysql.PoolOptions } options
   */
  constructor(options = {}) {
    this.#options = options
  }

  /**
   * @returns {mysql.Pool}
   */
  async #connect() {
    if (this.#options) {
      return await dbConnection(this.#options)
    }
    return await dbConnection()
  }

  async all(query, values = []) {
    try {
      const pool = await this.#connect()

      if (values.length < 0) {
        return await pool.execute(query)
      } else {
        return await pool.execute(query, values)
      }
    } catch (error) {
      throw error
    }
  }
}

module.exports = Execute
