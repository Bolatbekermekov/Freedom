import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema({
	token: {
		type: String,
		required: true,
	},
	title: {
		type: String,
		required: true,
	},
	body: {
		type: String,
		required: true,
	},
	data: { type: Object },
	dateSent: { type: Date, default: Date.now },
})

export const Notification = mongoose.model('Notification', notificationSchema)
