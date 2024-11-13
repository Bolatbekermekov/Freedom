import { IUser } from '@/core/models/user.model'
import { IProducts } from '@/modules/admin/products/models/product.model'

export interface IShippingInfo {
	address: string
	city: string
	country: string
}

export enum PAYMENT_METHODS {
	COD = 'COD',
	ONLINE = 'ONLINE'
}

export interface IPaymentInfo {
	id: string
	status: string
}

export interface IOrderItems {
	name: string
	barcode: string
	image: string
	price: number
	quantity: number
	product: IProducts
}

export interface IOrderItemsDTO {
	product: IProducts
	quantity: number
}

export enum ORDER_STATUSES {
	ALL = 'All',
	ACTIVE = 'Active',
	CREATED = 'Order Created',
	REVIEW_REJECTED_BY_USER = 'REVIEW_REJECTED_BY_USER',
	UPDATED_BY_ADMIN = 'UPDATED_BY_ADMIN',
	PREPARING = 'Preparing',
	SHIPPED = 'Shipped',
	DELIVERED = 'Delivered',
	NEXT_DAY_SHIPPING = 'NEXT_DAY_SHIPPING',
	CANCELLED = 'Cancelled'
}

export interface OrderReceiptReview {
	orderId: string
	userId: string
	approved: boolean
	comment: string | null
}

export enum ORDER_PAYMENT_STATUSES {
	PAID = 'Paid',
	UNPAID = 'Unpaid'
}

export interface IOrders {
	_id: string
	shippingInfo: IShippingInfo
	orderItems: IOrderItems[]
	paymentMethod: PAYMENT_METHODS
	isPaid: boolean
	itemsPrice: number
	taxPrice: number
	discountPercentage?: number
	discount?: number
	shippingCharges: boolean
	totalAmount: number
	orderStatus: ORDER_STATUSES
	createdAt: Date
	assignee?: IUser
	autoId: number
	receiptReview?: OrderReceiptReview
	customer: {
		name: string
		phone: string
		user: IUser
	}
}
