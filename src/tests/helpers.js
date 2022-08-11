const supertest = require('supertest')
const { app } = require('../index')

const api = supertest(app)

const getDocuments = async (model) => {
	const documents = await model.find({})
	return documents
}

module.exports = {
	api,
	getDocuments,
}
