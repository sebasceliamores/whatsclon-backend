/* eslint-disable no-undef */
/* eslint-disable camelcase */
const mongoose = require('mongoose')
const { server } = require('../index')
const { api } = require('../tests/helpers')
const Tb_chats = require('../database/models/Tb_chats')

describe('Creating a new contact', () => {
	beforeEach(async () => {
		await Tb_chats.deleteMany({})

		const chat = new Tb_chats({
			chat_user_id_1: '111',
			chat_user_id_2: '222',
		})

		await chat.save()
	})

	test('uworks as expected creating a fresh contact', async () => {
		const newChat = {
			chat_user_id_1: '333',
			chat_user_id_2: '222',
		}

		const response = await api
			.post('/api/chats')
			.send(newChat)
			.expect(200)
			.expect('Content-Type', /application\/json/)

		expect(response.body.chat_user_id_1).toBe(newChat.chat_user_id_1)
		expect(response.body.chat_user_id_2).toBe(newChat.chat_user_id_2)
	})

	test('creation fails because chat are exist', async () => {
		const newChat = {
			chat_user_id_1: '111',
			chat_user_id_2: '222',
		}

		const response = await api
			.post('/api/chats')
			.send(newChat)
			.expect(400)
			.expect('Content-Type', /application\/json/)

		expect(response.body.error).toContain('chat is already exist')
	})
})

test('creation fails because chat are exist reversed ids', async () => {
	const newChat = {
		chat_user_id_1: '222',
		chat_user_id_2: '111',
	}

	const response = await api
		.post('/api/chats')
		.send(newChat)
		.expect(400)
		.expect('Content-Type', /application\/json/)

	expect(response.body.error).toContain('chat is already exist')
})

afterAll(async () => {
	mongoose.connection.close()
	server.close()
})
