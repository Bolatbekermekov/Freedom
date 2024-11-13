import mongoose from 'mongoose'

const schema = new mongoose.Schema({
	address: {
		type: String,
		required: [true, 'Please Enter Address'],
	},
	country: {
		type: String,
		required: [true, 'Please Enter Country'],
	},
	city: {
		type: String,
		required: [true, 'Please Enter City'],
	},
	isDefault: {
		type: Boolean,
		default: false,
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
})

// Создание модели на основе схемы
export const ShippingInfo = mongoose.model('ShippingInfo', schema)
