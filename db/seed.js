import mongoose from 'mongoose'
import 'dotenv/config'

import User from '../models/user.js'
import Feedpost from '../models/feedpost.js'

import userData from './data/users.js'
import postData from './data/posts.js'

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Database connected')

    // Clear DB
    await User.deleteMany()
    await Feedpost.deleteMany()

    // Users
    const users = await User.create(userData)
    console.log(`${users.length} users created`)
    
    // Posts
    const postsWithAuthors = postData.map(post => {
      const author = users[Math.floor(Math.random() * users.length)]._id
      const addLikes = () => {
        const likes = []
        const limit = Math.floor(Math.random() * users.length)
        let count = 0
        while(count <= limit) {
          likes.push(users[Math.floor(Math.random() * users.length)]._id)
          count++
        }
        return [...new Set(likes)]
      }
      return { 
        ...post,
        author,
        replies: post.replies.map(reply => ({ ...reply, author: users[Math.floor(Math.random() * users.length)]._id })),
        likes: addLikes()
      }
    })
    
    const posts = await Feedpost.create(postsWithAuthors)
    console.log(`${posts.length} posts created`)

    await mongoose.connection.close()
    console.log('Database connection closed')

  } catch (error) {
    console.log(error)
  }
}
seedDatabase()