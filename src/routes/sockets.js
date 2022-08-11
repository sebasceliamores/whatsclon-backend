const { Router } = require('express')
const { getSocketByUserId, createNewSocket, deleteSocket } = require('../controllers/sockets')

const router = Router()

router.get('/api/sockets/:id', getSocketByUserId)

router.post('/api/sockets', createNewSocket)

router.delete('/api/sockets/:id', deleteSocket)

module.exports = router
