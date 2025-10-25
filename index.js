const express = require('express')
const dotenv = require('@dotenvx/dotenvx')
const miniORM = require('./miniORM')

dotenv.config()

/**
 * @type {miniORM} model
 */
const model = new miniORM({
  user: 'root',
  database: 'blog',
})

const PORT = process.env.PORT || 3000
const app = express()

app.get('/', async (req, res) => {
  try {
    const results = await model.done()
    return res.send(results)
  } catch (error) {
    throw new Error(error.message)
  }
})

app.listen(PORT, () => console.log(`Listening on port ${PORT}...`))
