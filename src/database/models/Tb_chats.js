/* eslint-disable camelcase */
const { model, Schema } = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const chatsSchema = new Schema({
	chat_user_id_1: {
		type: Schema.Types.ObjectId,
		ref: 'Tb_users',
		required: true,
	},
	chat_user_id_2: {
		type: Schema.Types.ObjectId,
		ref: 'Tb_users',
		required: true,
	},
	chat_count_message: {
		type: Schema.Types.Number,
		default: 1,
	},
})

chatsSchema.set('toJSON', {
	transform: (document, returnedObject) => {
		returnedObject.chat_id = returnedObject._id
		delete returnedObject._id
		delete returnedObject.__v
	},
})

chatsSchema.plugin(uniqueValidator)

const Tb_chats = model('tb_chats', chatsSchema)

module.exports = Tb_chats
