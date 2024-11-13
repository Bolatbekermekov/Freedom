export interface ValueWithChangeRate {
	value: number
	changeRate: number
}

export interface GraphItem {
	label: string
	value: string
}

export interface PlatformStatistics {
	customersCount: number
	storesCount: number
	productsCount: number
	completedOrdersCount: number
	monthlyActiveUsers: number
	registeredUsersForCurrentMonth: number
}

export interface StoresStatistics {
	totalSales: number
	products: number
	totalOrders: number
	activeOrders: number
	completedOrders: number
	employees: number
}
