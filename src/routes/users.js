/* eslint-disable camelcase */
const { Router } = require('express')
const { getUsers, createNewUser, getUserById, getUserByEmail } = require('../controllers/users')
// const userExtractor = require('../middleware/userExtractor')

const router = Router()

router.get('/api/users', getUsers)

router.post('/api/users', createNewUser)

// router.use(userExtractor)

router.get('/api/users/findById/:id', getUserById)

router.get('/api/users/findByEmail/:email', getUserByEmail)

module.exports = router
