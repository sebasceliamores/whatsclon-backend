/* eslint-disable camelcase */
const Tb_chats = require('../database/models/Tb_chats')
const parseObjectId = require('mongodb').ObjectId

const getMyChats = async (request, response) => {
	const { id } = request.params
	const idObject = new parseObjectId(id)

	const chats = await Tb_chats.aggregate([
		{ $match: { $or: [{ chat_user_id_1: idObject }, { chat_user_id_2: idObject }] } },
		{
			$lookup: {
				from: 'tb_contacts',
				let: { userId: id, contactId: '$chat_user_id_1', contactId2: '$chat_user_id_2' },
				pipeline: [
					{
						$match: {
							$or: [
								{
									$and: [
										{ $expr: { $eq: ['$cont_user_id', '$$userId'] } },
										{ $expr: { $eq: ['$cont_contact_id', '$$contactId'] } },
									],
								},
								{
									$and: [
										{ $expr: { $eq: ['$cont_user_id', '$$userId'] } },
										{ $expr: { $eq: ['$cont_contact_id', '$$contactId2'] } },
									],
								},
							],
						},
					},
				],
				as: 'contact',
			},
		},
		{
			$unwind: {
				path: '$contact',
				preserveNullAndEmptyArrays: true,
			},
		},
		{
			$project: {
				_id: 1,
				chat_user_id_1: 1,
				chat_user_id_2: 1,
				chat_count_message: 1,
				cont_displayName: '$contact.cont_displayName',
				cont_are_contacts: '$contact.cont_are_contacts',
				cont_contact_id: '$contact.cont_contact_id',
				contactInfoId: {
					$cond: {
						if: { $eq: ['$chat_user_id_1', idObject] },
						then: '$chat_user_id_2',
						else: '$chat_user_id_1',
					},
				},
			},
		},
		{
			$lookup: {
				from: 'tb_users',
				let: { userId: '$contactInfoId' },
				pipeline: [
					{
						$match: {
							$expr: { $eq: ['$_id', '$$userId'] },
						},
					},
				],
				as: 'contactInfo',
			},
		},
		{
			$unwind: {
				path: '$contactInfo',
				preserveNullAndEmptyArrays: true,
			},
		},
		{
			$lookup: {
				from: 'tb_messages',
				let: {
					chatId: '$_id',
				},
				pipeline: [
					{
						$match: {
							$expr: { $eq: ['$mess_chat_id', '$$chatId'] },
						},
					},
					{
						$sort: {
							mess_sendAt: -1,
						},
					},
					{
						$limit: 1,
					},
				],
				as: 'lastMessage',
			},
		},
		{
			$unwind: {
				path: '$lastMessage',
				preserveNullAndEmptyArrays: true,
			},
		},
		{
			$sort: {
				lastMessage: -1,
			},
		},
	])

	chats.length > 0
		? response.status(200).json(chats)
		: response.status(404).json({ error: 'Chats not found' })
}

const getOneChatWithInfo = async (request, response) => {
	const { chat_id, id } = request.body
	const idObject = new parseObjectId(id)

	const chat = await Tb_chats.aggregate([
		{ $match: { _id: parseObjectId(chat_id) } },
		{
			$lookup: {
				from: 'tb_contacts',
				let: { userId: id, contactId: '$chat_user_id_1', contactId2: '$chat_user_id_2' },
				pipeline: [
					{
						$match: {
							$or: [
								{
									$and: [
										{ $expr: { $eq: ['$cont_user_id', '$$userId'] } },
										{ $expr: { $eq: ['$cont_contact_id', '$$contactId'] } },
									],
								},
								{
									$and: [
										{ $expr: { $eq: ['$cont_user_id', '$$userId'] } },
										{ $expr: { $eq: ['$cont_contact_id', '$$contactId2'] } },
									],
								},
							],
						},
					},
				],
				as: 'contact',
			},
		},
		{
			$unwind: {
				path: '$contact',
				preserveNullAndEmptyArrays: true,
			},
		},

		{
			$project: {
				_id: 1,
				chat_user_id_1: 1,
				chat_user_id_2: 1,
				cont_displayName: '$contact.cont_displayName',
				cont_are_contacts: '$contact.cont_are_contacts',
				cont_contact_id: '$contact.cont_contact_id',
				contactInfoId: {
					$cond: {
						if: { $eq: ['$chat_user_id_1', idObject] },
						then: '$chat_user_id_2',
						else: '$chat_user_id_1',
					},
				},
			},
		},
		{
			$lookup: {
				from: 'tb_users',
				let: { userId: '$contactInfoId' },
				pipeline: [
					{
						$match: {
							$expr: { $eq: ['$_id', '$$userId'] },
						},
					},
				],
				as: 'contactInfo',
			},
		},
		{
			$unwind: {
				path: '$contactInfo',
				preserveNullAndEmptyArrays: true,
			},
		},
		{
			$lookup: {
				from: 'tb_messages',
				let: {
					chatId: '$_id',
				},
				pipeline: [
					{
						$match: {
							$expr: { $eq: ['$mess_chat_id', '$$chatId'] },
						},
					},
					{
						$sort: {
							mess_sendAt: -1,
						},
					},
					{
						$limit: 1,
					},
				],
				as: 'lastMessage',
			},
		},
		{
			$unwind: {
				path: '$lastMessage',
				preserveNullAndEmptyArrays: true,
			},
		},
	])

	chat.length > 0
		? response.status(200).json(chat[0])
		: response.status(404).json({ error: 'Chats not found' })
}

const getOneChatWithInfoSocket = async (chat_id, user_id) => {
	const idObject = new parseObjectId(user_id)

	const chat = await Tb_chats.aggregate([
		{ $match: { _id: parseObjectId(chat_id) } },
		{
			$lookup: {
				from: 'tb_contacts',
				let: {
					userId: user_id.toString(),
					contactId: '$chat_user_id_1',
					contactId2: '$chat_user_id_2',
				},
				pipeline: [
					{
						$match: {
							$or: [
								{
									$and: [
										{ $expr: { $eq: ['$cont_user_id', '$$userId'] } },
										{ $expr: { $eq: ['$cont_contact_id', '$$contactId'] } },
									],
								},
								{
									$and: [
										{ $expr: { $eq: ['$cont_user_id', '$$userId'] } },
										{ $expr: { $eq: ['$cont_contact_id', '$$contactId2'] } },
									],
								},
							],
						},
					},
				],
				as: 'contact',
			},
		},
		{
			$unwind: {
				path: '$contact',
				preserveNullAndEmptyArrays: true,
			},
		},

		{
			$project: {
				_id: 1,
				chat_user_id_1: 1,
				chat_user_id_2: 1,
				cont_displayName: '$contact.cont_displayName',
				cont_are_contacts: '$contact.cont_are_contacts',
				cont_contact_id: '$contact.cont_contact_id',
				chat_count_message: 1,
				contactInfoId: {
					$cond: {
						if: { $eq: ['$chat_user_id_1', idObject] },
						then: '$chat_user_id_2',
						else: '$chat_user_id_1',
					},
				},
			},
		},
		{
			$lookup: {
				from: 'tb_users',
				let: { userId: '$contactInfoId' },
				pipeline: [
					{
						$match: {
							$expr: { $eq: ['$_id', '$$userId'] },
						},
					},
				],
				as: 'contactInfo',
			},
		},
		{
			$unwind: {
				path: '$contactInfo',
				preserveNullAndEmptyArrays: true,
			},
		},
		{
			$lookup: {
				from: 'tb_messages',
				let: {
					chatId: '$_id',
				},
				pipeline: [
					{
						$match: {
							$expr: { $eq: ['$mess_chat_id', '$$chatId'] },
						},
					},
					{
						$sort: {
							mess_sendAt: -1,
						},
					},
					{
						$limit: 1,
					},
				],
				as: 'lastMessage',
			},
		},
		{
			$unwind: {
				path: '$lastMessage',
				preserveNullAndEmptyArrays: true,
			},
		},
	])

	return chat[0]
}

const getOneChat = async (request, response) => {
	const { chat_user_id_1, chat_user_id_2 } = request.body

	const idObject1 = new parseObjectId(chat_user_id_1)
	const idObject2 = new parseObjectId(chat_user_id_2)

	const chatExist = await Tb_chats.findOne({
		$or: [
			{ chat_user_id_1: idObject1, chat_user_id_2: idObject2 },
			{ chat_user_id_1: idObject2, chat_user_id_2: idObject1 },
		],
	})

	chatExist
		? response.status(200).json(chatExist)
		: response.status(400).json({ error: 'Chat not found' })
}

const getContactChat = async (chat_id, user_id) => {
	const chat = await Tb_chats.findById(chat_id)

	const contact_id =
		chat.chat_user_id_1.toString() === user_id.toString()
			? chat.chat_user_id_2
			: chat.chat_user_id_1

	return contact_id
}

const createChat = async (request, response) => {
	const { chat_user_id_1, chat_user_id_2 } = request.body

	const idObject1 = new parseObjectId(chat_user_id_1)
	const idObject2 = new parseObjectId(chat_user_id_2)

	try {
		const chat = await Tb_chats({
			chat_user_id_1: idObject1,
			chat_user_id_2: idObject2,
		})

		const chatExist = await Tb_chats.findOne({
			$or: [
				{ chat_user_id_1: idObject1, chat_user_id_2: idObject2 },
				{ chat_user_id_1: idObject2, chat_user_id_2: idObject1 },
			],
		})

		if (!chatExist) {
			const newChat = await chat.save()
			return response.status(200).json(newChat)
		} else {
			return response.status(400).json({ error: 'chat is already exist' })
		}
	} catch (error) {
		return response.status(400).json({ error: error.message })
	}
}

const createChatSocket = async (chat_user_id_1, chat_user_id_2) => {
	const idObject1 = new parseObjectId(chat_user_id_1)
	const idObject2 = new parseObjectId(chat_user_id_2)

	try {
		const chat = await Tb_chats({
			chat_user_id_1: idObject1,
			chat_user_id_2: idObject2,
		})

		const chatExist = await Tb_chats.findOne({
			$or: [
				{ chat_user_id_1: idObject1, chat_user_id_2: idObject2 },
				{ chat_user_id_1: idObject2, chat_user_id_2: idObject1 },
			],
		})

		if (!chatExist) {
			const newChat = await chat.save()
			return newChat
		} else {
			return null
		}
	} catch (error) {
		return { error: error.message }
	}
}

const IncrementCountMessageSocket = async (chat_id) => {
	console.log(chat_id)
	const count = await Tb_chats.findByIdAndUpdate(chat_id, {
		$inc: {
			chat_count_message: +1,
		},
	})

	return count
}

const setZeroCountMessageSocket = async (chat_id) => {
	const count = await Tb_chats.findByIdAndUpdate(chat_id, {
		$set: {
			chat_count_message: 0,
		},
	})

	return count
}

const deleteChat = async (request, response) => {
	const { id } = request.params

	const deleteChat = await Tb_chats.findByIdAndDelete(id)
	deleteChat
		? response.status(200).json({ message: 'chat deleted' })
		: response.status(404).json({ error: 'chat not found' })
}

module.exports = {
	getMyChats,
	getOneChat,
	createChat,
	createChatSocket,
	deleteChat,
	getContactChat,
	getOneChatWithInfo,
	getOneChatWithInfoSocket,
	IncrementCountMessageSocket,
	setZeroCountMessageSocket,
}
