export default validateToken = async (req, res, next) => {
  try {
    // 1. Check that an authorization header is present on the request
    // 2. If the header is not present, we'll send a 401
    // 3. If the header is present, is it the correct syntax
    // 4. If the header is invalid, send a 401
    // 5. If the header is valid, verify the token (this will check the secret and the expiry)
    // 6. If the token is invalid, send a 401
    // 7. If the token is valid, ensure the user still exists
    // 8. If the user is not found, 401
    // 9. If the user is found, pass it to the controller
  } catch (error) {
    console.log(error)
  }
}