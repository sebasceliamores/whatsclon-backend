/* eslint-disable no-undef */
/* eslint-disable camelcase */
const mongoose = require('mongoose')
const { server } = require('../index')
const { api, getDocuments } = require('../tests/helpers')
const Tb_users = require('../database/models/Tb_users')

describe('Creating a new user', () => {
	beforeEach(async () => {
		await Tb_users.deleteMany({})
		const user = new Tb_users({
			user_name: 'root',
			user_lastname: 'CeliRoot',
			user_email: 'sebasceliamores@gmail.com',
			user_urlPhoto: 'saldjasdlajlda',
			user_state: 'Never',
		})

		await user.save()
	})

	test('uworks as expected creating a fresh user', async () => {
		const newUser = {
			user_name: 'Juan',
			user_lastname: 'Perez',
			user_email: 'sebastianceliamores@gmail.com',
			user_urlPhoto: 'saldjasdlajlda',
			user_state: 'Never',
		}

		const response = await api
			.post('/api/users')
			.send(newUser)
			.expect(201)
			.expect('Content-Type', /application\/json/)

		expect(response.body).toEqual(expect.objectContaining(newUser))
	})

	test('creation fails with proper statuscode and message if username is alraedy taken', async () => {
		const userAtStart = await getDocuments(Tb_users)
		const newUser = {
			user_name: 'Juan',
			user_lastname: 'Perez',
			user_email: 'sebasceliamores@gmail.com',
			user_urlPhoto: 'saldjasdlajlda',
			user_state: 'Never',
		}

		const response = await api
			.post('/api/users')
			.send(newUser)
			.expect(400)
			.expect('Content-Type', /application\/json/)

		expect(response.body.error).toContain('`user_email` to be unique')
		const userAtEnd = await getDocuments(Tb_users)
		expect(userAtEnd.length).toBe(userAtStart.length)
	})

	test('creation fails with proper statuscode and message if user_name is empty', async () => {
		const userAtStart = await getDocuments(Tb_users)
		const newUser = {
			user_name: '',
			user_lastname: 'Perez',
			user_email: 'sebasceliamores@gmail.com',
			user_urlPhoto: 'saldjasdlajlda',
			user_state: 'Never',
		}

		const response = await api
			.post('/api/users')
			.send(newUser)
			.expect(400)
			.expect('Content-Type', /application\/json/)

		expect(response.body.error).toContain('`user_name` is required')
		const userAtEnd = await getDocuments(Tb_users)
		expect(userAtEnd.length).toBe(userAtStart.length)
	})
})

afterAll(async () => {
	mongoose.connection.close()
	server.close()
})
