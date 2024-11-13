import { SALES_PERIODS } from '../../monitoring/components/monitoring-sales/SalesLineChart'
import { GraphItem } from '../../monitoring/models/monitoring-dto.type'
import {
	OrdersByAssignedUsersDTO,
	OrdersByStatusesDTO,
	PeriodTypesDTO,
	SuperAdminTotalsDTO,
	TotalsDTO
} from '../models/totals.dto'

import { axiosWithAuth } from '@/core/api/interceptors'
import { environment } from '@/core/config/environment.config'

class DashboardAPIClass {
	baseUrl = `${environment.apiUrl}/api/v2/admin/analytics`

	async getTotals(): Promise<TotalsDTO> {
		return axiosWithAuth.get(`${this.baseUrl}/total`).then(res => res.data)
	}

	async getSuperAdminTotals(): Promise<SuperAdminTotalsDTO> {
		return axiosWithAuth
			.get(`${this.baseUrl}/superadmin/total`)
			.then(res => res.data)
	}

	async getSalesByPeriod(periodType: SALES_PERIODS): Promise<GraphItem[]> {
		const params = {
			periodType
		}

		return axiosWithAuth
			.get(`${this.baseUrl}/sales-by-period`, { params: params })
			.then(res => res.data)
	}

	async getAssignedOrdersAnalytics(
		dto: PeriodTypesDTO
	): Promise<OrdersByAssignedUsersDTO[]> {
		const params = {
			...dto
		}

		return axiosWithAuth
			.get(`${this.baseUrl}/orders-by-assignees`, { params: params })
			.then(res => res.data)
	}

	async getOrdersByStatusesAnalytics(
		dto: PeriodTypesDTO
	): Promise<OrdersByStatusesDTO[]> {
		const params = {
			...dto
		}

		return axiosWithAuth
			.get(`${this.baseUrl}/orders-by-statuses`, { params: params })
			.then(res => res.data)
	}
}

export const DashboardAPIService = new DashboardAPIClass()
