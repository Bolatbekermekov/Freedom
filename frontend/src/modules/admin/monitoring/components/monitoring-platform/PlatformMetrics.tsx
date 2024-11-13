'use client'

import { useQuery } from '@tanstack/react-query'
import { Activity, Package, Store, Truck, UserPlus, Users } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { monitoringApiService } from '../../services/monitoring-api.service'
import { AnalyticsCard } from '../AnalyticsCard'

import { Skeleton } from '@/core/ui/skeleton'

const statistics = {
	CUSTOMERS: {
		title: 'MONITORING.PLATFORM_METRICS.CUSTOMERS',
		value: 0,
		icon: Users
	},
	STORES: {
		title: 'MONITORING.PLATFORM_METRICS.STORES',
		value: 0,
		icon: Store
	},
	PRODUCTS: {
		title: 'MONITORING.PLATFORM_METRICS.PRODUCTS',
		value: 0,
		icon: Package
	},
	COMPLETED_ORDERS: {
		title: 'MONITORING.PLATFORM_METRICS.COMPLETED_ORDERS',
		value: 0,
		icon: Truck
	},
	ACTIVE_USERS: {
		title: 'MONITORING.PLATFORM_METRICS.MONTHLY_ACTIVE_USERS',
		value: 0,
		icon: Activity
	},
	REGISTERED_USERS: {
		title: 'MONITORING.PLATFORM_METRICS.REGISTERED_USERS_THIS_MONTH',
		value: 0,
		icon: UserPlus
	}
}

const skeletonsArray = new Array(6).fill(1)

export const PlatformMetrics = () => {
	const { t } = useTranslation()

	const { data, isPending } = useQuery({
		queryKey: ['platform-statistics'],
		queryFn: () => monitoringApiService.getPlatformStatistics()
	})

	const renderedStatistics = useMemo(() => {
		statistics.CUSTOMERS.value = data?.customersCount ?? 0
		statistics.STORES.value = data?.storesCount ?? 0
		statistics.PRODUCTS.value = data?.productsCount ?? 0
		statistics.COMPLETED_ORDERS.value = data?.completedOrdersCount ?? 0
		statistics.ACTIVE_USERS.value = data?.monthlyActiveUsers ?? 0
		statistics.REGISTERED_USERS.value =
			data?.registeredUsersForCurrentMonth ?? 0

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
