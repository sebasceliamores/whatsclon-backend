const { Server: websocketServer } = require('socket.io')
const { URL_CLIENT } = require('./config')
const parseObjectId = require('mongodb').ObjectId
const {
	createMessageSocket,
	setViewedMessageSocket,
	setHeardAudioMessageSocket,
} = require('./controllers/messages')
const {
	createChatSocket,
	getOneChatWithInfoSocket,
	IncrementCountMessageSocket,
	setZeroCountMessageSocket,
} = require('./controllers/chats')
const { createNewSocket, deleteSocket, getSocketByUserId } = require('./controllers/sockets')
const { UpdateUserLastConnection, getLastConnectionById } = require('./controllers/users')
const { uploadAudio } = require('./cloudinary/index')

const socketMiddleware = (httpServer) => {
	const io = new websocketServer(httpServer, {
		cors: {
			origin: URL_CLIENT,
		},
	})

	io.on('connection', (socket) => {
		console.log('a user connected')

		const { user_id } = socket.handshake.query

		const emitCreateNewChat = async (chatId, contactId, newMessage) => {
			const contactSocket = await getSocketByUserId(contactId)
			const dataUser = await getOneChatWithInfoSocket(chatId, user_id)
			io.to(socket.id).emit('server:createNewChat', dataUser, newMessage)
			if (contactSocket) {
				const dataContact = await getOneChatWithInfoSocket(chatId, contactId)
				io.to(contactSocket.sock_id).emit('server:createNewChat', dataContact, newMessage)
			}
		}

		const emitNewMessage = async (message, chat_id, contactId) => {
			const contactSocket = await getSocketByUserId(contactId)
			const data = { message, chat_id }
			if (contactSocket) {
				io.to(contactSocket.sock_id).emit('server:NewMessage', data)
			}
			io.to(socket.id).emit('server:NewMessage', data)
		}

		const emitViewedMessage = async (message, chat_id, contactId) => {
			const contactSocket = await getSocketByUserId(contactId)
			const data = { message, chat_id }
			if (contactSocket) {
				io.to(contactSocket.sock_id).emit('server:ViewedMessage', data)
			}
			io.to(socket.id).emit('server:ViewedMessage', data)
		}

		const emitIsContactOnline = async (contactId) => {
			const contactSocket = await getSocketByUserId(contactId)
			if (contactSocket) {
				io.to(socket.id).emit('server:IsContactOnline', { isOnline: true })
			} else {
				const data = await getLastConnectionById(parseObjectId(contactId))
				io.to(socket.id).emit('server:IsContactOnline', data)
			}
		}

		const emitIsTyping = async (contactId, chat_id, isTyping) => {
			const contactSocket = await getSocketByUserId(contactId)
			if (contactSocket) {
				const data = { isTyping, chat_id, contactId }
				io.to(contactSocket.sock_id).to(socket.id).emit('server:IsTyping', data)
			}
		}

		socket.on('client:SaveSocketId', async () => {
			const socketExist = await getSocketByUserId(user_id)
			if (!socketExist) {
				const socketSave = await createNewSocket(user_id, socket.id)
				socket.emit('server:SaveSocketId', socketSave)
			} else {
				socket.emit('server:SaveSocketId', socketExist)
			}
		})

		socket.on('client:JoinChatRoom', (chatRoomId) => {
			const chatId = chatRoomId.toString()
			socket.join(chatId)
			console.log('join+', socket.rooms)
		})

		socket.on('client:LeaveChatRoom', (chatRoomId) => {
			const chatId = chatRoomId.toString()
			socket.leave(chatId)
			console.log('leave', socket.rooms)
		})

		socket.on('client:CreateNewChat', async (data, dataMessage) => {
			const { chat_user_id_1, chat_user_id_2, contactId } = data
			const newChat = await createChatSocket(chat_user_id_1, chat_user_id_2)
			if (newChat) {
				const newMessage = await createMessageSocket({
					...dataMessage,
					mess_chat_id: newChat._id,
				})
				const chatId = newChat._id.toString()
				emitCreateNewChat(chatId, contactId, newMessage)
			}
		})

		socket.on('client:NewMessage', async (data) => {
			const { messages, contactId, file } = data
			const { mess_isMedia } = messages
			if (mess_isMedia === 'audio') {
				const fileUpload = await uploadAudio(file)
				messages.mess_media = {
					url: fileUpload.secure_url,
					public_id: fileUpload.public_id,
					duration: fileUpload.duration,
					isHeard: false,
				}
				console.log(fileUpload)
			}

			const newMessage = await createMessageSocket(messages)
			await IncrementCountMessageSocket(newMessage.mess_chat_id)
			const chatId = newMessage.mess_chat_id.toString()
			emitNewMessage(newMessage, chatId, contactId)
		})

		socket.on('client:ViewedMessage', async (data) => {
			const { mess_id, mess_chat_id, mess_viewedAt, contactId, mess_isMedia, mess_media } = data
			let messageData = {}
			let message = {}
			if (mess_isMedia === 'audio') {
				messageData = { mess_id, mess_media }
				message = await setHeardAudioMessageSocket(messageData)
			} else {
				messageData = { mess_id, mess_chat_id, mess_viewedAt }
				message = await setViewedMessageSocket(messageData)
			}

			console.log(message)
			await setZeroCountMessageSocket(message.mess_chat_id)
			if (message) {
				const chatId = mess_chat_id.toString()
				emitViewedMessage(message, chatId, contactId)
			}
		})

		socket.on('client:isContactOnline', async (data) => {
			const { contactId } = data
			emitIsContactOnline(contactId)
		})

		socket.on('client:IsTyping', async (data) => {
			const { chat_id, contactId, isTyping } = data
			emitIsTyping(contactId, chat_id, isTyping)
		})

		socket.on('disconnect', async () => {
			console.log('user disconnected')
			socket.leaveAll()
			await UpdateUserLastConnection(user_id)
			await deleteSocket(user_id)
		})
	})
}

module.exports = socketMiddleware
