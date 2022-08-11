const ERROR_HANDLER = {
	CastError: (res) => res.status(400).send({ error: 'id used is malformed' }),
	ValidationError: (res, error) => res.status(400).send({ error: error.message }),
	JsonWebTokenError: (res, error) => res.status(401).send({ error: 'token missing or invalid' }),
	TokenExpireError: (res) => res.status(401).send({ error: 'token expired' }),
	defaultError: (res) => res.status(500).end(),
}

const handleErrors = (error, request, response) => {
	const handler = ERROR_HANDLER[error.name] || ERROR_HANDLER.defaultError

	handler(response, error)
}

module.exports = handleErrors
