import express from 'express'

// Router
const router = express.Router()


// Routes/Controllers
router.post('/signup', async (req, res, next) => {
  if(!req.body.username) {
    return res.status(422).json({ message: "provide a username" })
  }

  // Otherwise success!
  return res.json({ message: 'Hit the signup route' })
})

// Export the router for use in the server.js file
export default router