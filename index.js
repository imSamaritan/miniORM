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
      .select(null)
      .where({post_author: 'imsamaritan'})
      .done()
    return res.send(results)
  } catch (error) {
    res.status(400).send(error.message)
  }
})

app.listen(PORT, () => console.log(`Listening on port ${PORT}...`))
