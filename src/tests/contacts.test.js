/* eslint-disable no-undef */
/* eslint-disable camelcase */
const mongoose = require('mongoose')
const { server } = require('../index')
const { api } = require('../tests/helpers')
const Tb_contacts = require('../database/models/Tb_contacts')

describe('Creating a new contact', () => {
	beforeEach(async () => {
		await Tb_contacts.deleteMany({})
		const contact = new Tb_contacts({
			cont_displayName: 'root',
			cont_contact_id: 222,
			cont_user_id: 111,
		})

		await contact.save()
	})

	test('uworks as expected creating a fresh contact', async () => {
		const newContact = {
			cont_displayName: 'sebas',
			cont_contact_id: 111,
			cont_user_id: 222,
		}

		const response = await api
			.post('/api/contacts')
			.send(newContact)
			.expect(201)
			.expect('Content-Type', /application\/json/)

		expect(response.body)
	})

	test('creation fails because contact are exist', async () => {
		const newContact = {
			cont_displayName: 'root',
			cont_contact_id: 222,
			cont_user_id: 111,
		}

		const response = await api.post('/api/contacts').send(newContact).expect(400)

		expect(response.body.error).toContain('contact is already exist')
	})
})

afterAll(async () => {
	mongoose.connection.close()
	server.close()
})
