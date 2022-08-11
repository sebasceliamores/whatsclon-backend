/* eslint-disable camelcase */
const Tb_contacts = require('../database/models/Tb_contacts')

const getAllContacts = async (request, response) => {
	const contacts = await Tb_contacts.find({})
	contacts.length > 0
		? response.status(302).json(contacts)
		: response.status(404).json({ error: 'Contacts not found' })
}

const getMyContactsById = async (request, response) => {
	const { id } = request.params

	const contacts = await Tb_contacts.aggregate([
		{ $match: { cont_user_id: id } },
		{
			$lookup: {
				from: 'tb_users',
				localField: 'cont_contact_id',
				foreignField: '_id',
				as: 'contact',
			},
		},
		{ $unwind: '$contact' },
	])

	// const contacts = await Tb_contacts.find({ cont_user_id: id })

	contacts.length > 0
		? response.status(200).json(contacts)
		: response.status(404).json({ error: 'Contacts not found' })
}

const verifyContactAdd = async (request, response) => {
	const { cont_user_id, cont_contact_id } = request.body
	const contact = await Tb_contacts.findOne({
		cont_user_id: cont_user_id,
		cont_contact_id: cont_contact_id,
	})
	if (contact) {
		return response.status(200).json({ error: 'Contact already exists' })
	} else {
		return response.status(200).json({ message: 'Contact not exist' })
	}
}

const createContact = async (request, response) => {
	const { cont_displayName, cont_contact_id, cont_user_id } = request.body
	let areContacts = false

	const userSide = await Tb_contacts.findOne({
		cont_contact_id: cont_contact_id,
		cont_user_id: cont_user_id,
	})

	const contactSide = await Tb_contacts.findOne({
		cont_contact_id: cont_user_id,
		cont_user_id: cont_contact_id,
	})

	try {
		if (userSide) {
			return response.status(400).send({ error: 'contact is already exist' })
		}

		if (contactSide) {
			areContacts = true
		}

		const contact = new Tb_contacts({
			cont_displayName,
			cont_contact_id,
			cont_user_id,
			cont_are_contacts: areContacts,
		})

		const savedContact = await contact.save()
		if (savedContact && areContacts) {
			await Tb_contacts.updateOne(
				{
					cont_contact_id: cont_user_id,
					cont_user_id: cont_contact_id,
				},
				{
					cont_are_contacts: true,
				}
			)
		}
		return response.status(201).json(savedContact)
	} catch (error) {
		response.status(400).json({ error: 'Contact already exist' })
	}
}

module.exports = {
	getAllContacts,
	getMyContactsById,
	createContact,
	verifyContactAdd,
}
