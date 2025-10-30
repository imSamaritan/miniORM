import express from 'express'
import dotenv from '@dotenvx/dotenvx'
import miniORM from './miniORM.js'

dotenv.config()

const model = new miniORM()
model.setTable('posts')

const PORT = process.env.PORT || 3000
const app = express()

app.get('/', async (req, res) => {
  try {
    const results = await model
      .select('post_id', 'post_title', 'post_body')
      .where({ post_author: 'imsamaritan' })
      .done()
    return res.send(results)
  } catch (error) {
    res.status(400).send(error.message)
  }
})

app.listen(PORT, () => console.log(`Listening on port ${PORT}...`))
