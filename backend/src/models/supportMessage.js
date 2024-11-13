import mongoose from 'mongoose'

const schema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'Please Enter Your Name'],
	},
	contact: {
		type: String,
		required: [true, 'Please Enter Your Contact Info'],
	},
	message: {
		type: String,
		required: [true, 'Please Enter Your Message'],
	},
})

export const SupportMessage = mongoose.model('SupportMessage', schema)
