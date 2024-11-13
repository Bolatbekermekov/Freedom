import {
	Pageable,
	PaginatedResult
} from '../../../../core/models/paginated.model'
import {
	AssignUserToOrderDTO,
	CreateOrderDTO,
	IOrdersFilter,
	UpdateOrderDTO,
	UpdateOrderPaymentDTO
} from '../models/orders-dto.model'
import { IOrders } from '../models/orders.model'

import { axiosWithAuth } from '@/core/api/interceptors'
import { environment } from '@/core/config/environment.config'

class AdminOrdersAPIClass {
	baseUrl = `${environment.apiUrl}/api/v2/admin/orders`

	async getOrders(
		pageable: Pageable,
		filter?: IOrdersFilter
	): Promise<PaginatedResult<IOrders[]>> {
		const params = {
			...pageable,
			...filter
		}

		return axiosWithAuth
			.get(`${this.baseUrl}`, { params: params })
			.then(res => res.data)
	}

	async getOrder(id: string): Promise<IOrders> {
		return axiosWithAuth.get(`${this.baseUrl}/${id}`).then(res => res.data)
	}

	async createOrder(dto: CreateOrderDTO) {
		return axiosWithAuth.post(`${this.baseUrl}`, dto).then(res => res.data)
	}

	async updateOrder(id: string, dto: UpdateOrderDTO) {
		return axiosWithAuth.put(`${this.baseUrl}/${id}`, dto).then(res => res.data)
	}

	async assignUserToOrder(id: string, dto: AssignUserToOrderDTO) {
		return axiosWithAuth
			.post(`${this.baseUrl}/${id}/assignee`, dto)
			.then(res => res.data)
	}

	async updatePayment(id: string, dto: UpdateOrderPaymentDTO) {
		return axiosWithAuth
			.post(`${this.baseUrl}/${id}/payment`, dto)
			.then(res => res.data)
	}
}

export const adminOrdersAPIService = new AdminOrdersAPIClass()
