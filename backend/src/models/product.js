import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'

const schema = new mongoose.Schema(
	{
		productCode: {
			type: String,
			required: [true, 'Please Enter Product Code'],
		},
		name: {
			type: String,
			required: [true, 'Please Enter Name'],
			index: true,
		},
		onecname: {
			type: String,
			required: false,
		},
		description: {
			type: String,
			required: [true, 'Please Enter Description'],
			index: true,
		},
		extraDescription: {
			type: String,
			required: false,
		},
		price: {
			type: Number,
			required: [true, 'Please Enter Price'],
		},
		stock: {
			type: Number,
			required: [true, 'Please Enter Stock'],
		},
		characteristics: {
			type: Map,
			of: String,
			_id: false,
			required: false,
		},
		manufacturer: {
			// производитель
			type: String,
			required: false,
		},
		country: {
			// страна производства
			type: String,
			required: false,
		},
		packageSize: {
			// количество в упаковке
			type: String,
			required: false,
		},
		images: [String],
		labels: {
			type: String,
			required: false,
		},
		measureUnit: {
			type: String,
			required: false,
		},
		color: {
			type: String,
			required: false,
		},
		size: {
			type: String,
			required: false,
		},
		hidden: {
			type: Boolean,
			required: false,
			default: false,
		},
		barcode: {
			type: String,
			required: false,
			index: true,
		},
		category: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Category',
		},
		company: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'Company',
		},
		createdAt: {
			type: Date,
			default: Date.now,
		},
	},
	{
		toJSON: { virtuals: true }, // Include virtuals in toJSON
		toObject: { virtuals: true }, // Include virtuals in toObject
	},
)

// Virtual for 'imageUrl' that appends base URL to the image path
schema.virtual('imageUrls').get(function () {
	if (!this.images || !Array.isArray(this.images)) {
		return [] // Возвращаем пустой массив, если нет изображений
	}

	// Если this.images существует и корректен, формируем URL-адреса
	return this.images.map(image => `${process.env.BASE_URL}${image}`)
})

const recentProductSchema = new mongoose.Schema({
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
})

schema.plugin(mongoosePaginate)
schema.index()

export const Product = mongoose.model('Product', schema)
export const RecentProduct = mongoose.model('RecentProduct', recentProductSchema)
