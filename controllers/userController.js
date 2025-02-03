import express from 'express'
import User from '../models/user.js'
import jwt from 'jsonwebtoken'
import { generateToken } from '../utils/tokens.js'

// Router
const router = express.Router()


// Routes/Controllers
router.post('/signup', async (req, res, next) => {
  try {
    const user = await User.create(req.body)

    // If the user is successfully created, we now want to provide the client with a token that identifies them as an authenticated user
    const token = generateToken(user)

    return res.status(201).json({ 
      message: 'User created successfully', 
      token
    })
  } catch (error) {
    next(error)
  }
})

router.post('/login', async (req, res, next) => {
  try {
    // Search the user collection for a document with a matching username OR email
    const foundUser = await User.findOne({ $or: [{ username: req.body.identifier }, { email: req.body.identifier }] })

    // If the search returns null, return an unauthorized error
    if(!foundUser) {
      console.log('Username or email was incorrect')
      return res.status(401).json({ message: 'Invalid credentials provided' })
    }

    // If the search returns a user object, we need to ensure the password matches the user object
    if (!foundUser.isPasswordValid(req.body.password)) return res.status(401).json({ message: 'Invalid credentials provided' })

    // If the password matches, generate a token
    const token = generateToken(foundUser)

    // Return the token to the client
    return res.json({ message: 'Login was successful', token })
  } catch (error) {
    next(error)
  }
})

// Export the router for use in the server.js file
export default router