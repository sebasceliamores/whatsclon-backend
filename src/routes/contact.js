/* eslint-disable camelcase */
const { Router } = require('express')
const {
	getAllContacts,
	getMyContactsById,
	createContact,
	verifyContactAdd,
} = require('../controllers/contacts')
// const userExtractor = require('../middleware/userExtractor')

const router = Router()

// router.use(userExtractor)

router.get('/api/contacts', getAllContacts)

router.post('/api/contacts', createContact)

router.post('/api/contacts/verify', verifyContactAdd)

router.get('/api/contacts/findById/:id', getMyContactsById)

module.exports = router
