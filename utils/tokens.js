import jwt from 'jsonwebtoken'
import 'dotenv/config'

export const generateToken = (user) => {
  return jwt.sign(
      // Define the payload 
      {
        user: {
          _id: user._id,
          username: user.username
        }
      },
      // Define the secret
      process.env.TOKEN_SECRET,
      // Define the expiry date
      { expiresIn: '24h' }
    )
}