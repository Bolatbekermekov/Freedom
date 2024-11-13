import { useQuery } from '@tanstack/react-query'
import {
	Activity,
	CheckCircle,
	LineChart,
	List,
	Package,
	User
} from 'lucide-react'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { monitoringApiService } from '../../services/monitoring-api.service'
import { AnalyticsCard } from '../AnalyticsCard'

import { Skeleton } from '@/core/ui/skeleton'

interface SalesStatisticsProps {
	storeId: string
}

const statistics = {
	TOTAL_SALES: {
		title: 'MONITORING.STORES_METRICS.STATISTICS.TOTAL_SALES',
		value: '',
		icon: LineChart
	},
	TOTAL_ORDERS: {
		title: 'MONITORING.STORES_METRICS.STATISTICS.TOTAL_ORDERS',
		value: 0,
		icon: List
	},
	ACTIVE_ORDERS: {
		title: 'MONITORING.STORES_METRICS.STATISTICS.ACTIVE_ORDERS',
		value: 0,
		icon: Activity
	},
	COMPLETED_ORDERS: {
		title: 'MONITORING.STORES_METRICS.STATISTICS.COMPLETED_ORDERS',
		value: 0,
		icon: CheckCircle
	},
	PRODUCTS: {
		title: 'MONITORING.STORES_METRICS.STATISTICS.PRODUCTS',
		value: 0,
		icon: Package
	},
	EMPLOYEES: {
		title: 'MONITORING.STORES_METRICS.STATISTICS.EMPLOYEES',
		value: 0,
		icon: User
	}
}

const skeletonsArray = new Array(6).fill(1)

export const SalesStatistics = ({ storeId }: SalesStatisticsProps) => {
	const { t } = useTranslation()

	const { data, isPending } = useQuery({
		queryKey: ['monitoring-stores-statistics', { storeId }],
		queryFn: () => monitoringApiService.getStoresStatistics(storeId)
	})

	const renderedStatistics = useMemo(() => {
		statistics.TOTAL_SALES.value = `${data?.totalSales.toLocaleString() ?? 0} ₸`
		statistics.TOTAL_ORDERS.value = data?.totalOrders ?? 0
		statistics.ACTIVE_ORDERS.value = data?.activeOrders ?? 0
		statistics.COMPLETED_ORDERS.value = data?.completedOrders ?? 0
		statistics.PRODUCTS.value = data?.products ?? 0
		statistics.EMPLOYEES.value = data?.employees ?? 0

		return Object.values(statistics).map(item => (
			<AnalyticsCard
				key={item.title}
				title={t(item.title)}
				value={item.value.toLocaleString()}
				icon={item.icon}
			/>
		))
	}, [data, t])

	return (
		<div className='grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-5 lg:grid-cols-3'>
			{isPending &&
				skeletonsArray.map((_, idx) => (
					<Skeleton
						key={idx}
						className='h-32 rounded-2xl'
					/>
				))}

			{data && renderedStatistics}
		</div>
	)
}
