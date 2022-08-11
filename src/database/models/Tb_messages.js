/* eslint-disable camelcase */
const { model, Schema } = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const messagesSchema = new Schema({
	mess_message: {
		type: String,
		default: null,
	},
	mess_viewed: {
		type: Boolean,
		default: false,
	},
	mess_sendAt: {
		type: Date,
		required: true,
	},
	mess_viewedAt: {
		type: Date,
		default: null,
	},
	mess_isMedia: {
		type: String,
		default: null,
	},
	mess_media: {
		type: Object,
		default: null,
	},
	mess_chat_id: {
		type: Schema.Types.ObjectId,
		ref: 'Tb_chats',
		required: true,
	},
	mess_user_id: {
		type: Schema.Types.String,
		ref: 'Tb_users',
		required: true,
	},
})

messagesSchema.set('toJSON', {
	transform: (document, returnedObject) => {
		returnedObject.mess_id = returnedObject._id
		delete returnedObject._id
		delete returnedObject.__v
	},
})

messagesSchema.plugin(uniqueValidator)

const Tb_messages = model('tb_messages', messagesSchema)

module.exports = Tb_messages
