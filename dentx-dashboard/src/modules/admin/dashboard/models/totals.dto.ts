export interface TotalsDTO {
	sales: number
	products: number
	orders: number
	activeOrders: number
	completedOrders: number
	members: number
}

export interface SuperAdminTotalsDTO {
	users: number
	clinics: number
	stores: number
}

export interface OrdersByAssignedUsersDTO {
	user: string
	orders: number
}

export interface OrdersByStatusesDTO {
	status: string
	orders: number
}

export interface DatesRangeDTO {
	startDate?: string
	endDate?: string
	year?: number
}

export enum AnalyticsPeriodTypes {
	DAILY = 'daily',
	WEEKLY = 'weekly',
	MONTHLY = 'monthly',
	QUARTERLY = 'quarterly',
	YEARLY = 'yearly'
}

export interface PeriodTypesDTO {
	periodType: AnalyticsPeriodTypes
}

export interface SalesByPeriodDTO {
	label: string
	sale: number
}
