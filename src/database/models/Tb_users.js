/* eslint-disable camelcase */
const { model, Schema } = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const userSchema = new Schema({
	user_name: {
		type: String,
		required: true,
	},
	user_lastname: {
		type: String,
		required: true,
	},
	user_email: {
		type: String,
		unique: true,
		required: true,
	},
	user_urlPhoto: String,
	user_state: String,
	user_lastConnection: {
		type: Date,
		default: null,
	},
})

userSchema.set('toJSON', {
	transform: (document, returnedObject) => {
		returnedObject.user_id = returnedObject._id.toString()
		delete returnedObject._id
		delete returnedObject.__v
	},
})

userSchema.plugin(uniqueValidator)

const Tb_users = model('tb_users', userSchema)

module.exports = Tb_users
