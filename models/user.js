import mongoose from 'mongoose'
import validator from 'validator'
import bcrypt from 'bcrypt'

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please provide an email address.'],
    unique: true,
    validate: {
      message: "Please enter a valid email.",
      validator: (email) => validator.isEmail(email)
    },
  },
  username: {
    type: String,
    required: [true, 'Please provide a username.'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Please provide a password.'],
    validate: [
      {
        message: "Password must be at least 8 characters in length.",
        validator: (password) => password.length >= 8
      },
      {
        message: "Password must contain at least 1 lowercase, uppercase, and symbol",
        validator: (password) => validator.isStrongPassword(password, 
          { minLowercase: 1, minUppercase: 1, minSymbols: 1, minNumbers: 1 }
        )
      }
    ]
  },
  bio: {
    type: String
  },
  profileImage: {
    type: String
  }
})

userSchema.pre('save', function(next) {
  // 'this' refers to the doc you're about to save.
  // this line replaces the password with the hashed password.
  // isModified ensures we are actually trying to create or modify a password, ensuring we don't hash an already hashed password
  if (this.isModified('password')){
    this.password = bcrypt.hashSync(this.password, bcrypt.genSaltSync())
  }
  next() // this tells mongoose we're done.
})

// This method is available on an user document, and allows us to check if a plain text password matches a stored hash, returning a boolean
userSchema.methods.isPasswordValid = function(plainTextPassword){
  const isValid = bcrypt.compareSync(plainTextPassword, this.password)
  console.log(`Password is valid: ${isValid}`)
  return isValid
}


const User = mongoose.model('User', userSchema)
export default User