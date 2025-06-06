import serverless from 'serverless-http'
import express from 'express'
import mongoose from 'mongoose'
import mongoSanitize from 'express-mongo-sanitize'
import 'dotenv/config'
import cors from 'cors' // This imports the cors middleware

// Custom middleware
import logger from '../..//middleware/logger.js'
import errorHandler from '../../middleware/errorHandler.js'

// Controllers/Routers
import userController from '../../controllers/userController.js'
import feedPostController from '../../controllers/feedPostController.js'

const app = express()
const port = process.env.PORT || 3000 // Use PORT env variable if it exists, default to 3000


// Use Middleware
app.use(cors())
app.use(express.json()) // Parses JSON body types, adding them to req.body
app.use(mongoSanitize()) // Prevent code injection
app.use(logger) // This is a logger, logging out key information on incoming requests

// Controllers / Routes
app.use('/', userController)
app.use('/', feedPostController)

// Error Handling
app.use(errorHandler)

// Server Connection
const establishServerConnections = async () => {
  try {
    // Connect to the database
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('👍 Database connection established')
  } catch (error) {
    console.log(error)
  }
}
establishServerConnections()

module.exports.handler = serverless(app)