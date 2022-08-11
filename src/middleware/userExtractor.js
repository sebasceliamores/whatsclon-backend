/* eslint-disable no-undef */
const jwt = require('jsonwebtoken')

module.exports = (request, response, next) => {
	const authorization = request.get('Authorization')
	let token = null

	if (authorization && authorization.toLowerCase().startsWith('bearer')) {
		token = authorization.substring(7)
	}

	const decodedToken = jwt.verify(token, process.env.JWT_SECRET)

	if (!token || !decodedToken.id) {
		return response.status(401).json({ error: 'token missing or invalid' })
	}

	const { id } = decodedToken
	request.userId = id
	next()
}
