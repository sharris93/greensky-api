import express from 'express'
import mongoose from 'mongoose'
import mongoSanitize from 'express-mongo-sanitize'
import 'dotenv/config'

// Custom middleware
import logger from './middleware/logger.js'

// Controllers/Routers
import userController from './controllers/userController.js'

const app = express()
const port = process.env.PORT || 3000 // Use PORT env variable if it exists, default to 3000


// Use Middleware
app.use(express.json()) // Parses JSON body types, adding them to req.body
app.use(mongoSanitize()) // Prevent code injection
app.use(logger) // This is a logger, logging out key information on incoming requests


// Controllers / Routes
app.use('/', userController)

// Error Handling

// Server Connection
const establishServerConnections = async () => {
  try {
    // Connect to the database
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('👍 Database connection established')

    // Listen for server connections
    app.listen(port, () => console.log(`🚀 Server up and running on port ${port}`))
  } catch (error) {
    console.log(error)
  }
}
establishServerConnections()