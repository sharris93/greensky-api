export default function errorHandler(e, req, res, next) {
  console.log(e, e.name)

  // If the ID is an invalid format, a CastError will be thrown
  if (e.name === 'CastError') {
    return res.status(400).json({
      message: "Hey, the ID you provided was not valid. Please provide a valid ID!"
    })
  
  // If a unique constraint has been violated (existing username), you'll see a 11000 code
  } else if (e.code === 11000) {
    const identifier = Object.keys(e.keyValue)[0]
    return res.status(409).json({ errors: { [identifier]: `That ${identifier} already exists. Please try another one.` } })
  
  // If there is a validation error on the request body, you'll see this error
  // A validation might be an incorrect type of data, or not meeting criteria like a minimum length
  } else if (e.name === 'ValidationError') {
    const customError = {}
    for (const key in e.errors) {
      customError[key] = e.errors[key].message
    }
    res.status(422).send({ errors: customError, message: "There are issues with the data you posted." })

  // Anything else we'll return as a 500 status, Internal Server error
  // Simply because we're not sure what it is, so it's likely on our end.
  } else {
    res.status(500).send({ message: "Something went wrong. Please check your request and try again!" })
  }
}