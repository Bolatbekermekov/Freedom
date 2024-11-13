import { IOrders } from './orders.model'
import { IUser } from '@/core/models/user.model'

export interface CreateOrderReceiptReview {
	orderId: string
	userId: string
	comment: string
}

export interface UpdateOrderReceiptReview {
	comment: string
}

export interface OrderReceiptReviewPopulated {
	orderId: IOrders
	userId: IUser
	comment: string
	createdAt: Date
	updatedAt: Date
}

export interface OrderReceiptReviewFlat {
	_id: string
	orderId: string
	userId: string
	comment: string
	createdAt: Date
	updatedAt: Date
}
