import {
	CreateOrderReceiptReview,
	OrderReceiptReviewFlat,
	OrderReceiptReviewPopulated,
	UpdateOrderReceiptReview
} from '../models/order-receipt.model'

import { axiosWithAuth } from '@/core/api/interceptors'
import { environment } from '@/core/config/environment.config'

export class OrderReceiptService {
	private baseUrl = `${environment.apiUrl}/api/v2/order-receipt`

	async createReview(review: CreateOrderReceiptReview) {
		const response = await axiosWithAuth.post<OrderReceiptReviewFlat>(
			`${this.baseUrl}`,
			review
		)
		return response.data
	}

	async getReviewByOrderId(orderId: string) {
		const response = await axiosWithAuth.get<OrderReceiptReviewPopulated>(
			`${this.baseUrl}/${orderId}`
		)
		return response.data
	}

	async updateReview(
		orderId: string,
		review: UpdateOrderReceiptReview
	): Promise<any> {
		const response = await axiosWithAuth.put(
			`${this.baseUrl}/${orderId}`,
			review
		)
		return response.data
	}

	async getOrderPDFBlobUrl(orderId: string): Promise<string> {
		const response = await fetch(`${this.baseUrl}/${orderId}/pdf`, {
			credentials: 'include'
		})
		const blob = await response.blob()
		const url = window.URL.createObjectURL(blob)
		return url
	}
}

export const orderReceiptService = new OrderReceiptService()
