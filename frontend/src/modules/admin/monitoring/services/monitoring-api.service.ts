import {
	GraphItem,
	PlatformStatistics,
	StoresStatistics,
	ValueWithChangeRate
} from '../models/monitoring-dto.type'

import { axiosWithAuth } from '@/core/api/interceptors'
import { environment } from '@/core/config/environment.config'

class MonitoringAPIService {
	private readonly baseUrl = `${environment.apiUrl}/api/v2/superadmin/analytics`

	async getAverageDailySalesForCurrentMonth(id: string) {
		const response = await axiosWithAuth.get<ValueWithChangeRate>(
			`${this.baseUrl}/stores/${id}/avg-daily-sales`
		)

		return response.data
	}

	async getSalesByPeriodType(id: string, periodType = '1day') {
		const response = await axiosWithAuth.get<GraphItem[]>(
			`${this.baseUrl}/stores/${id}/sales-by-period`,
			{ params: { periodType } }
		)

		return response.data
	}

	async getTotalOrdersForCurrentMonth(id: string) {
		const response = await axiosWithAuth.get<ValueWithChangeRate>(
			`${this.baseUrl}/stores/${id}/total-orders`
		)

		return response.data
	}

	async getTotalSalesForCurrentMonth(id: string) {
		const response = await axiosWithAuth.get<ValueWithChangeRate>(
			`${this.baseUrl}/stores/${id}/total-sales`
		)

		return response.data
	}

	async getPlatformStatistics() {
		const response = await axiosWithAuth.get<PlatformStatistics>(
			`${this.baseUrl}/platform/statistics`
		)

		return response.data
	}
	async getStoresStatistics(id: string) {
		const response = await axiosWithAuth.get<StoresStatistics>(
			`${this.baseUrl}/stores/${id}/statistics`
		)

		return response.data
	}

	async getRegisteredUsersByMonth() {
		const response = await axiosWithAuth.get<GraphItem[]>(
			`${this.baseUrl}/platform/registered-users-by-month`
		)

		return response.data
	}

	async getCreatedOrdersByMonth() {
		const response = await axiosWithAuth.get<GraphItem[]>(
			`${this.baseUrl}/platform/created-orders-by-month`
		)

		return response.data
	}

	async getCompletedOrdersByMonth() {
		const response = await axiosWithAuth.get<GraphItem[]>(
			`${this.baseUrl}/platform/completed-orders-by-month`
		)

		return response.data
	}
}

export const monitoringApiService = new MonitoringAPIService()
