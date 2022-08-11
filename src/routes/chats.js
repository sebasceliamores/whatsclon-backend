const { Router } = require('express')
const {
	getMyChats,
	getOneChat,
	createChat,
	deleteChat,
	getOneChatWithInfo,
} = require('../controllers/chats')

const router = Router()

router.post('/api/chats', createChat)
router.delete('/api/chats/id', deleteChat)
router.get('/api/chats/:id', getMyChats)
router.post('/api/chats/findOne', getOneChat)
router.post('/api/chats/find', getOneChatWithInfo)

module.exports = router
