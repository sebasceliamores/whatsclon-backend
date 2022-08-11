const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const { verifyOrCreateUserWithGoogle } = require('../controllers/auth')

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:3001/auth/google/callback'
},
async function (accessToken, refreshToken, profile, cb) {
  const user = await verifyOrCreateUserWithGoogle(profile)

  return cb(null, user)
}
))

passport.serializeUser(function (user, cb) {
  cb(null, user)
} // user is an instance of User
)

passport.deserializeUser(function (user, cb) {
  cb(null, user)
} // user is an instance of User
)
