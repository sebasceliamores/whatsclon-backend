const { Router } = require('express')
const { createMessage, getAllMyMessages } = require('../controllers/messages')

const router = Router()

router.post('/api/messages', createMessage)
router.get('/api/messages/:id', getAllMyMessages)

module.exports = router
