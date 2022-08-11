const mongoose = require('mongoose')

const { NODE_ENV, MONGODB_URI, MONGODB_URI_TEST } = require('../config')

const connectionString = NODE_ENV === 'test' ? MONGODB_URI_TEST : MONGODB_URI

mongoose
	.connect(connectionString)
	.then(() => {
		console.log('is connected to MongoDB')
	})
	.catch((error) => {
		console.error('error connecting to MongoDB:', error.message)
	})

// eslint-disable-next-line no-undef
process.on('uncaughtException', () => {
	mongoose.disconnect()
})
