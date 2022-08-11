/* eslint-disable camelcase */
const Tb_messages = require('../database/models/Tb_messages')

const nPerPage = 10

const getAllMyMessages = async (request, response) => {
	const { id } = request.params

	const messages = await Tb_messages.find({ mess_chat_id: id })
	messages.length > 0
		? response.status(200).json(messages)
		: response.status(404).json({ error: 'messages not found' })
}

const getMessagesByPages = async (request, response) => {
	const { id } = request.params
	const { pageNumber } = request.body
	const messages = await Tb_messages.find({ mess_chat_id: id })
		.skip(parseInt(pageNumber) > 0 ? (parseInt(pageNumber) - 1) * nPerPage : 0)
		.limit(nPerPage)
		.sort({ mess_createAt: -1 })

	messages.length > 0
		? response.status(200).json(messages)
		: response.status(404).json({ error: 'messages not found' })
}

const createMessage = async (request, response) => {
	const { mess_chat_id, mess_message, mess_user_id, mess_sendAt } = request.body
	const message = new Tb_messages({
		mess_chat_id,
		mess_user_id,
		mess_message,
		mess_sendAt,
	})

	try {
		const newMessage = await message.save()
		return response.status(200).json(newMessage)
	} catch (error) {
		response.status(400).json({ error: error.message })
	}
}

const createMessageSocket = async (data) => {
	const message = new Tb_messages({
		...data,
	})

	try {
		const newMessage = await message.save()

		return newMessage
	} catch (error) {
		return null
	}
}

const setViewedMessageSocket = async (data) => {
	const { mess_id, mess_viewedAt } = data

	try {
		const message = await Tb_messages.findByIdAndUpdate(
			mess_id,
			{
				mess_viewedAt,
				mess_viewed: true,
			},
			{ new: true }
		)

		return message
	} catch (error) {
		return null
	}
}

const setHeardAudioMessageSocket = async (data) => {
	const { mess_id, mess_media } = data
	try {
		const message = await Tb_messages.findByIdAndUpdate(
			mess_id,
			{
				mess_media: {
					...mess_media,
					isHeard: true,
				},
			},
			{ new: true }
		)

		return message
	} catch (error) {
		return null
	}
}

module.exports = {
	getAllMyMessages,
	getMessagesByPages,
	createMessage,
	createMessageSocket,
	setViewedMessageSocket,
	setHeardAudioMessageSocket,
}
