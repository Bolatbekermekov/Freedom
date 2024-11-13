import mongoose from 'mongoose'

const orderReceiptReviewSchema = new mongoose.Schema(
	{
		orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
		userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		approved: { type: Boolean, required: true, default: false },
		comment: { type: String, default: null },
	},
	{ timestamps: true },
)

export const OrderReceiptReview = mongoose.model('OrderReceiptReview', orderReceiptReviewSchema)
