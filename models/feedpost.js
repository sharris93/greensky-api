import mongoose from 'mongoose'

const replySchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    validate: {
      message: 'A post must not exceed 250 characters.',
      validator: (content) => content.length <= 250
    }
  },
  author: {
    type: mongoose.Schema.Types.ObjectId, // This specifies a one-to-many referenced relationship
    ref: 'User', // This refers to the name of the model that this field is related to (user in this case)
    required: [true, 'Please provide an author field']
  },
}, {
  timestamps: true
})

const feedpostSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    validate: {
      message: 'A post must not exceed 250 characters.',
      validator: (content) => content.length <= 250
    }
  },
  author: {
    type: mongoose.Schema.Types.ObjectId, // This specifies a one-to-many referenced relationship
    ref: 'User', // This refers to the name of the model that this field is related to (user in this case)
    required: [true, 'Please provide an author field']
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId, // This specifies a one-to-many referenced relationship
    ref: 'User' // This refers to the name of the model that this field is related to (user in this case)
  }],
  replies: [replySchema]
}, {
  timestamps: true
})

export default mongoose.model('Feedpost', feedpostSchema)