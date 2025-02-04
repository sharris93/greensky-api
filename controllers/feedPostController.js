import express from 'express'
import validateToken from '../middleware/validateToken.js'
import Feedpost from '../models/feedpost.js'

const router = express.Router()

// * Index route
router.get('/feedposts', async (req, res, next) => {
  try {
    const feedposts = await Feedpost.find().populate('author')
    return res.json(feedposts)
  } catch (error) {
    next(error)
  }
})

// * Create route
router.post('/feedposts', validateToken, async (req, res, next) => {
  try {
    // The req.body is only going to contain the "content" field
    // _id, createdAt, updatedAt will all automatically be generated without us doing anything
    // Likes simply don't need to be passed on creation
    // * Author, however, needs to be created by us inside this controller, post token validation
    req.body.author = req.user._id
    const post = await Feedpost.create(req.body)
    return res.status(201).json(post)
  } catch (error) {
    next(error)
  }
})

// * Show route
router.get('/feedposts/:postId', async (req, res, next) => {
  try {
    const { postId } = req.params

    // 1. Search for the post based on the postId in the params
    const post = await Feedpost.findById(postId)

    // 2. Send a 404 if not found
    if(!post) return res.status(404).json({ message: 'Post not found' })

    // 3. Return the post if found
    return res.json(post)
  } catch (error) {
    next(error)
  }
})

// * Update route
router.put('/feedposts/:postId', validateToken, async (req, res, next) => {
  try {
    const { postId } = req.params
    
    // 1. Search for the post based on the postId in the params
    const post = await Feedpost.findById(postId)

    // 2. Send a 404 if not found
    if(!post) return res.status(404).json({ message: 'Post not found' })

    // 3. Authorize the logged in user as the author
    if (!req.user._id.equals(post.author)) return res.status(403).json({ message: 'You do not have permssion to access this resource' })

    // 4. Update the existing post with the req.body
    const updatedPost = await Feedpost.findByIdAndUpdate(postId, req.body, { returnDocument: 'after' })

    // 5. Return the updated post to the client
    return res.json(updatedPost)
  } catch (error) {
    next(error)
  }
})

// * Delete route
router.delete('/feedposts/:postId', validateToken, async (req, res, next) => {
  try {
    const { postId } = req.params
    
    // 1. Search for the post based on the postId in the params
    const post = await Feedpost.findById(postId)

    // 2. Send a 404 if not found
    if(!post) return res.status(404).json({ message: 'Post not found' })

    // 3. Authorize the logged in user as the author
    if (!req.user._id.equals(post.author)) return res.status(403).json({ message: 'You do not have permssion to access this resource' })

    // 4. Delete the existing post
    await Feedpost.findByIdAndDelete(postId)

    // 5. Return a 204 with no body
    return res.sendStatus(204)
  } catch (error) {
    next(error)
  }
})

// * Likes route
router.put('/feedposts/:postId/likes', validateToken, async (req, res, next) => {
  try {
    const { postId } = req.params
    
    // 1. Search for the post based on the postId in the params
    const post = await Feedpost.findById(postId)

    // 2. Send a 404 if not found
    if(!post) return res.status(404).json({ message: 'Post not found' })

    // 3. Identify whether user has already liked the post
    const alreadyLiked = post.likes.includes(req.user._id)

    // 4. If user has liked the post, remove the ObjectId from the likes array
    if (alreadyLiked) {
      const updatedPost = await Feedpost.findByIdAndUpdate(postId, {
        $pull: { likes: req.user._id }
      }, { returnDocument: 'after' })
      
      return res.json(updatedPost)

    // 5. If the user has not liked the post, add the user's ObjectId to the likes array
    } else {
      const updatedPost = await Feedpost.findByIdAndUpdate(postId, {
        $addToSet: { likes: req.user._id }
      }, { returnDocument: 'after' })
      
      return res.json(updatedPost)
    }

  } catch (error) {
    next(error)
  }
})

export default router