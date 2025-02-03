import express from 'express'
import validateToken from '../middleware/validateToken.js'

const router = express.Router()

// router.get('/feedposts', async (req, res, next) => {

// })

router.post('/feedposts', validateToken, async (req, res, next) => {
  console.log('REQ USER FROM validateToken()', req.user)
  return res.json({ message: 'Hit the feedpost create route'})
})

export default router