import mysql from 'mysql2/promise'
import dbConnection from '../db/db.js'

class Execute {
  /*** @type { mysql.PoolOptions } options **/
  #options

  /*** @param { mysql.PoolOptions } options **/
  constructor(options = {}) {
    this.#options = options
  }

  /*** @returns {Promise<mysql.Pool>} **/
  async #connect() {
    try {
      return await dbConnection(this.#options)
    } catch (error) {
      throw error
    }
  }

  async all(query, values = []) {
    try {
      const pool = await this.#connect()
      return await pool.execute(query, values)
    } catch (error) {
      throw error
    }
  }
}

export default Execute
