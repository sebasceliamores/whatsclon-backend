/* eslint-disable camelcase */
const { model, Schema } = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const contactSchema = new Schema({
	cont_displayName: String,
	cont_contact_id: {
		type: Schema.Types.ObjectId,
		ref: 'Tb_users',
		required: true,
	},
	cont_user_id: {
		type: String,
		required: true,
	},
	cont_are_contacts: {
		type: Boolean,
		default: false,
		required: true,
	},
})

contactSchema.set('toJSON', {
	transform: (document, returnedObject) => {
		returnedObject.cont_id = returnedObject._id
		delete returnedObject._id
		delete returnedObject.__v
	},
})

contactSchema.plugin(uniqueValidator)

const Tb_contacts = model('tb_contacts', contactSchema)

module.exports = Tb_contacts
