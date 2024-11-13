import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'

const schema = new mongoose.Schema({
	category: {
		type: String,
		required: [true, 'Please Enter Category'],
	},
	section: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Section',
		required: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
})

schema.index({ category: 1, section: 1 }, { unique: true })

const sectionSchema = new mongoose.Schema(
	{
		section: {
			type: String,
			required: [true, 'Please Enter Section'],
		},
		image: {
			type: String,
			default: 'images/categories/noimage.webp',
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
sectionSchema.virtual('imageUrl').get(function () {
	return `${process.env.BASE_URL}${this.image}`
})

sectionSchema.virtual('subCategories', {
	ref: 'Category',
	localField: '_id',
	foreignField: 'section',
	justOne: false,
})

schema.plugin(mongoosePaginate)
sectionSchema.plugin(mongoosePaginate)

export const Category = mongoose.model('Category', schema)
export const Section = mongoose.model('Section', sectionSchema)
