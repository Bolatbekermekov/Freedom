import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'
import validator from 'validator'

import { logger } from '../utils/logger.utils.js'

export const ORDER_STATUSES = {
	ORDER_CREATED: 'Order Created',
	REVIEW_REJECTED_BY_USER: 'REVIEW_REJECTED_BY_USER',
	UPDATED_BY_ADMIN: 'UPDATED_BY_ADMIN',
	PREPARING: 'Preparing',
	SHIPPED: 'Shipped',
	NEXT_DAY_SHIPPING: 'NEXT_DAY_SHIPPING',
	DELIVERED: 'Delivered',
	CANCELLED: 'Cancelled',
}

export const COMPLETED_ORDER_STATUSES = [
	ORDER_STATUSES.DELIVERED,
	ORDER_STATUSES.SHIPPED,
	ORDER_STATUSES.NEXT_DAY_SHIPPING,
]

export const ORDER_STATUSES_LIST = Object.values(ORDER_STATUSES)

const schema = new mongoose.Schema(
	{
		shippingInfo: {
			address: {
				type: String,
				required: true,
			},
			city: {
				type: String,
				required: true,
			},
			country: {
				type: String,
				required: true,
			},
		},
		orderItems: [
			{
				name: {
					type: String,
					required: true,
				},
				image: {
					type: String,
					required: true,
				},
				price: {
					type: Number,
					required: true,
				},
				quantity: {
					type: Number,
					required: true,
				},
				barcode: {
					type: String,
					required: false,
				},
				size: {
					type: String,
					required: false,
				},
				color: {
					type: String,
					required: false,
				},
				product: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'Product',
					required: true,
				},
			},
		],
		customer: {
			phone: {
				type: String,
				required: [true, 'Please Enter Phone'],
				validate: validator.isMobilePhone,
			},
			name: {
				type: String,
				required: [true, 'Please Enter Name'],
			},
			user: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User',
				required: false,
			},
		},
		paymentMethod: {
			type: String,
			enum: ['COD', 'ONLINE'],
			default: 'COD',
		},
		isPaid: {
			type: Boolean,
			default: false,
		},
		paidAt: Date,
		itemsPrice: {
			type: Number,
			required: true,
		},
		taxPrice: {
			type: Number,
			required: true,
			default: 0,
		},
		shippingCharges: {
			type: Boolean,
			enum: [true, false],
			required: false,
			default: false,
		},
		totalAmount: {
			type: Number,
			required: true,
		},
		discount: {
			type: Number,
			required: false,
			default: 0,
		},
		discountPercentage: {
			type: Number,
			required: false,
			default: 0,
		},
		appliedPromotion: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Promotion',
			required: false,
		},
		orderStatus: {
			type: String,
			enum: ORDER_STATUSES_LIST,
			default: 'Order Created',
		},
		deliveredAt: Date,
		storeCompany: {
			type: mongoose.Schema.Types.ObjectId,
			required: false,
			ref: 'Company',
		},
		assignee: {
			type: mongoose.Schema.Types.ObjectId,
			required: false,
			ref: 'User',
		},
		autoId: { type: Number, required: true },
	},
	{ timestamps: true },
)
schema.index({ autoId: 1, storeCompany: 1 }, { unique: true })

schema.plugin(mongoosePaginate)

export const Order = mongoose.model('Order', schema)

schema.pre('save', async function (next) {
	if (this.autoId) {
		return next()
	}

	try {
		const lastOrder = await this.constructor
			.findOne({ storeCompany: this.storeCompany })
			.sort({ autoId: -1 })

		this.autoId = lastOrder ? lastOrder.autoId + 1 : 1
		next()
	} catch (error) {
		logger.error('Failed to save autoId in order', error)
		next(error)
	}
})
