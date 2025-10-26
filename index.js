const express = require('express')
const dotenv = require('@dotenvx/dotenvx')
const miniORM = require('./miniORM')

dotenv.config()

const model = new miniORM({
  user: 'root',
  database: 'blog',
})

model.setTable('posts')

const PORT = process.env.PORT || 3000
const app = express()

app.get('/', async (req, res) => {
  try {
    const results = await model
      .selectAll()
      .where({ post_id: 1 })
      .done()
    return res.send(results[0][0])
  } catch (error) {
    throw error
  }
})

app.listen(PORT, () => console.log(`Listening on port ${PORT}...`))
