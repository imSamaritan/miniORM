const express = require('express')
const dotenv = require('@dotenvx/dotenvx')
const miniORM = require('./miniORM')

dotenv.config()

const model = new miniORM()
model.setTable('posts')

const PORT = process.env.PORT || 3000
const app = express()

app.get('/', async (req, res) => {
  try {
    const results = await model
      .select('post_id', 'post_author')
      .where({ post_author: 'John Doe' })
      .done()
    return res.send(results[0][0])
  } catch (error) {
    throw error
  }
})

app.listen(PORT, () => console.log(`Listening on port ${PORT}...`))
