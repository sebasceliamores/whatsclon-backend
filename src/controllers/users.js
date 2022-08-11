/* eslint-disable camelcase */
const Tb_users = require('../database/models/Tb_users')

const getUsers = async (request, response) => {
	try {
		const users = await Tb_users.find()
		response.status(200).json(users)
	} catch (error) {
		response.status(404).json({ error: 'No users found' })
	}
}

const getUserById = async (request, response, next) => {
	const { id } = request.params

	try {
		const user = await Tb_users.findById(id)
		return response.status(200).json(user)
	} catch (error) {
		response.status(404).json({ error: 'User not found' })
	}

	next()
}

const getUserByEmail = async (request, response) => {
	const { email } = request.params
	console.log(request.params)
	try {
		const user = await Tb_users.findOne({ user_email: email })
		user ? response.status(200).json(user) : response.status(404).json({ error: 'User not found' })
	} catch (error) {
		return response.status(404).json({ error: 'User not found' })
	}
}

const createNewUser = async (request, response) => {
	const { user_name, user_lastname, user_email, user_urlPhoto, user_state } = request.body

	try {
		const user = new Tb_users({
			user_name,
			user_lastname,
			user_email,
			user_urlPhoto,
			user_state,
		})

		const savedUser = await user.save()
		return response.status(201).json(savedUser)
	} catch (error) {
		return response.status(400).json({ error: error.message })
	}
}

const UpdateUserLastConnection = async (user_id) => {
	try {
		const user = await Tb_users.findByIdAndUpdate(user_id, { user_lastConnection: new Date() })
		return user
	} catch (error) {
		return null
	}
}

const getLastConnectionById = async (user_id) => {
	try {
		const user = await Tb_users.findById(user_id)
		return user.user_lastConnection
	} catch (error) {
		return null
	}
}

module.exports = {
	getUsers,
	createNewUser,
	getUserById,
	getUserByEmail,
	UpdateUserLastConnection,
	getLastConnectionById,
}
