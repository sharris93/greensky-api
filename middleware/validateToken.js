import jwt from 'jsonwebtoken'
import User from '../models/user.js'

export default async function validateToken(req, res, next) {
  try {
    console.log('RUNNING TOKEN VALIDATION')
    // 1. Check that an authorization header is present on the request
    const authHeader = req.headers.authorization

    // 2. If the header is not present, we'll send a 401
    if (!authHeader) {
      throw new Error('No authorization was present on the request')
    }

    // 3. If the header is present, is it the correct syntax
    // 4. If the header is invalid, send a 401
    if (!authHeader.startsWith('Bearer ')) {
      throw new Error('Invalid header syntax')
    }

    // 5. If the header is valid, verify the token (this will check the secret and the expiry)
    const token = authHeader.replace('Bearer ', '')
    const payload = jwt.verify(token, process.env.TOKEN_SECRET)

    // 6. If the token is valid, ensure the user still exists
    const user = await User.findById(payload.user._id)
    // 7. If the user is not found, 401
    if (!user) throw new Error('Token valid but user not found')
    // 8. If the user is found, pass it to the controller
    // req.user = user
    
    // 9. If we reach this point, we run next() to pass the request to the controller
    next()
  } catch (error) {
    console.log(error)
    // If the token is invalid, send a 401
    return res.status(401).json({ message: 'Invalid token'})
  }
}