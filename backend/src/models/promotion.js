import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'

const promotionSchema = new mongoose.Schema({
	company: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'Company',
	},
	promoCode: {
		type: String,
		required: function () {
			return this.promotionType === 'code'
		},
		unique: true,
		sparse: true,
	},
	description: {
		type: String,
		required: false,
	},
	startDate: {
		type: Date,
		required: function () {
			return this.promotionType === 'code'
		},
	},
	endDate: {
		type: Date,
		required: function () {
			return this.promotionType === 'code'
		},
	},
	discountPercentage: {
		type: Number,
		required: function () {
			return this.promotionType === 'code'
		},
		min: 0,
		max: 100,
	},
	maxUsage: {
		type: Number,
		required: function () {
			return this.promotionType === 'code'
		},
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	updatedAt: {
		type: Date,
		default: Date.now,
	},
	isActive: {
		type: Boolean,
		default: true,
	},
	promotionType: {
		type: String,
		enum: ['code', 'automatic'],
		required: true,
	},
	applicableCities: {
		type: [String],
		required: function () {
			return this.promotionType === 'automatic'
		},
	},
	minimumOrderValue: {
		type: Number,
		required: function () {
			return this.promotionType === 'automatic'
		},
	},
})
promotionSchema.plugin(mongoosePaginate)

promotionSchema.pre('save', function (next) {
	this.updatedAt = Date.now()
	next()
})

export const Promotion = mongoose.model('Promotion', promotionSchema)
