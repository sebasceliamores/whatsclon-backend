/* eslint-disable camelcase */
const { Router } = require('express')
const passport = require('passport')
const { afterSuccessAuth } = require('../controllers/auth')

const router = Router()

router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }))
router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  afterSuccessAuth)

module.exports = router
