import express from 'express'
import dotenv from '@dotenvx/dotenvx'
import mySQLizer from './mySQLizer.js'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// That's it! No shutdown handling needed - mySQLizer handles it automatically

app.get('/', async (req, res) => {
  try {
    const model = new mySQLizer()
    model.setTable('posts')

    const results = await model
      .select('post_id', 'post_title', 'post_body')
      .where('post_author', '=', 'imsamaritan')
      .done()

    res.json(results)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/all-posts', async (req, res) => {
  try {
    const model = new mySQLizer()
    model.setTable('posts')

    const results = await model.selectAll().done()
    res.json(results)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/users', async (req, res) => {
  try {
    const model = new mySQLizer()
    model.setTable('users')

    const results = await model
      .select('id', 'name', 'email')
      .where('status', '=', 'active')
      .done()

    res.json(results)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Start the server - auto shutdown is already configured!
app.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`)
  console.log('📊 Available endpoints:')
  console.log('  GET / - Posts by specific author')
  console.log('  GET /all-posts - All posts')
  console.log('  GET /users - Active users')
  console.log('')
  console.log(
    '✨ Auto shutdown enabled - just press Ctrl+C to gracefully stop!',
  )
  console.log('🐛 Debug: DEBUG=mySQLizer:* node auto-example.js')
})
