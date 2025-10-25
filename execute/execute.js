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

  async all() {
    const pool = await this.#connect()
    const [results] = await pool.execute('SELECT * FROM posts')

    return results
  }
}

module.exports = Execute
