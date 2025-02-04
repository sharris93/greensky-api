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
    const post = await Feedpost.findById(postId).populate('author').populate('replies.author')

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
    // Else, add the ObjectId to the likes array
    const updatedPost = await Feedpost.findByIdAndUpdate(postId, {
      [alreadyLiked ? '$pull' : '$addToSet']: { likes: req.user._id }
    }, { returnDocument: 'after' })
    
    return res.json(updatedPost)

  } catch (error) {
    next(error)
  }
})

// * Create reply route
router.post('/feedposts/:postId/replies', validateToken, async (req, res, next) => {
  try {
    const { postId } = req.params
    
    // 1. Search for the post based on the postId in the params
    const post = await Feedpost.findById(postId)

    // 2. Send a 404 if not found
    if(!post) return res.status(404).json({ message: 'Post not found' })

    // 3. Update the req.body to include the author field
    req.body.author = req.user._id

    // 4. If post found, add reply object (req.body) to the post.replies array
    post.replies.push(req.body)

    // 5. We save the post to persist the change we just made to the database
    await post.save()

    // 6. Send back the updated post
    return res.status(201).json(post)
  } catch (error) {
    next(error)
  }
})

// * Delete reply route
router.delete('/feedposts/:postId/replies/:replyId', validateToken, async (req, res, next) => {
  try {
    const { postId, replyId } = req.params
    
    // 1. Search for the post based on the postId in the params
    const post = await Feedpost.findById(postId)

    // 2. Send a 404 if not found
    if(!post) return res.status(404).json({ message: 'Post not found' })
    
    // 3. Find the post that is to be deleted using the id subdocument method https://mongoosejs.com/docs/subdocs.html#finding-a-subdocument
    const reply = post.replies.id(replyId)
    
    // 4. Check the logged in user (req.user) is either the reply author or the post author
    // If the logged in user is not the reply author, and they are not the post author, they're not permitted access
    if(!req.user._id.equals(reply.author) && !req.user._id.equals(post.author)){
      return res.status(403).json({ message: 'You do not have permssion to access this resource' })
    }

    // 5. Remove the post from the array
    reply.deleteOne()

    // 6. Save the post to persist the change to the database
    await post.save()

    // 7. Return the updated post to the client
    return res.sendStatus(204)
  } catch (error) {
    next(error)
  }
})

export default router