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

model.table('posts')

const PORT = process.env.PORT || 3000
const app = express()

app.get('/', async (req, res) => {
  try {
    console.log(model.getState())
    const results = await model
      .selectAll()
      .where({ post_id: 2 })
      .and()
      .where({ post_author: 'imsamaritan' })
      .done()
    return res.send(results[0][0])
  } catch (error) {
    throw error
  }
})

app.listen(PORT, () => console.log(`Listening on port ${PORT}...`))
