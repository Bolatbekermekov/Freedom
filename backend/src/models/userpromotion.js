import mongoose from 'mongoose'

const userPromotionSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'User',
	},
	promotion: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'Promotion',
	},
	used: {
		type: Boolean,
		default: false,
	},
	lastUsedAt: {
		type: Date,
	},
	usedCount: {
		type: Number,
		default: 0, // По умолчанию промо-код еще не использовался
	},
})

userPromotionSchema.index({ user: 1, promotion: 1 }, { unique: true })

export const UserPromotion = mongoose.model('UserPromotion', userPromotionSchema)
