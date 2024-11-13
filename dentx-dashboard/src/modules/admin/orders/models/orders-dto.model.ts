import {
	IOrderItems,
	IShippingInfo,
	ORDER_STATUSES,
	PAYMENT_METHODS
} from './orders.model'

export interface IOrdersFilter {
	searchValue?: string
	sort?: string
	status?: ORDER_STATUSES
	view?: string
}

export const OrdersSortTypes = {
	DATE_ASC: 'createdAt,asc',
	DATE_DESC: 'createdAt,desc'
}

export const OrdersViewTypes = {
	TABLE: 'table',
	LIST: 'list'
}

export const Orders = {
	TABLE: 'table',
	LIST: 'list'
}

export interface UpdateOrderDTO {
	status?: ORDER_STATUSES
	shippingInfo?: IShippingInfo
	orderItems?: IOrderItems[]
	paymentMethod?: PAYMENT_METHODS
	shippingCharges?: boolean
	customerName?: string
	customerPhone?: string
}

export interface AssignUserToOrderDTO {
	userId: string
}

export interface UpdateOrderPaymentDTO {
	isPaid: boolean
}

export interface CreateOrderDTO {
	shippingInfo: IShippingInfo
	orderItems: IOrderItems[]
	paymentMethod: PAYMENT_METHODS
	taxPrice: number
	shippingCharges: boolean
	customerName: string
	customerPhone: string
}
