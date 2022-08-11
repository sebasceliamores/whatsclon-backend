/* eslint-disable camelcase */
const { model, Schema } = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const socketsSchema = new Schema({
	sock_id: {
		type: Schema.Types.String,
		required: true,
	},
	sock_user_id: {
		type: Schema.Types.ObjectId,
		ref: 'Tb_users',
		required: true,
	},
})

socketsSchema.set('toJSON', {
	transform: (document, returnedObject) => {
		returnedObject.sock_mb_id = returnedObject._id
		delete returnedObject._id
		delete returnedObject.__v
	},
})

socketsSchema.plugin(uniqueValidator)

const Tb_sockets = model('tb_sockets', socketsSchema)

module.exports = Tb_sockets
