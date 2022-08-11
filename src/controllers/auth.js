/* eslint-disable no-undef */
/* eslint-disable camelcase */
const jwt = require('jsonwebtoken')
const Tb_users = require('../database/models/Tb_users')

const verifyOrCreateUserWithGoogle = async (profile) => {
	const { name, emails, photos } = profile

	const normalizedUserData = {
		user_name: name.givenName,
		user_lastname: name.familyName,
		user_email: emails[0].value,
		user_urlPhoto: photos[0].value,
	}

	const userExist = await Tb_users.findOne({ user_email: emails[0].value })
	let userData = null

	if (!userExist) {
		const user = new Tb_users({
			user_name: normalizedUserData.user_name,
			user_lastname: normalizedUserData.user_lastname,
			user_email: normalizedUserData.user_email,
			user_urlPhoto: normalizedUserData.user_urlPhoto,
			user_state: 'Hello, I am new here',
		})
		userData = await user.save()
	}

	return userExist || userData
}

// Successful authentication
const afterSuccessAuth = async (request, response) => {
	const { _id } = request.user

	const id = _id.toString()

	const token = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '24h' })

	response.cookie('token', token)
	response.cookie('user_id', id)
	return response.redirect('http://localhost:3000/')
}

module.exports = { verifyOrCreateUserWithGoogle, afterSuccessAuth }
