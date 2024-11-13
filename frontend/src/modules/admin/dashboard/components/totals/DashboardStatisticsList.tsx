'use client'

import { useQuery } from '@tanstack/react-query'
import {
	CheckCircle,
	DollarSign,
	ShoppingBasket,
	ShoppingCart,
	Users
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { DashboardAPIService } from '../../services/admin-dashboard.service'

import { DashboardStatisticItem } from './DashboardStatisticItem'
import { Skeleton } from '@/core/ui/skeleton'

export const DashboardStatisticsList = () => {
	const { t } = useTranslation()

	const { data, isPending } = useQuery({
		queryKey: ['analytics-totals'],
		queryFn: () => DashboardAPIService.getTotals()
	})

	const skeletonsArray = new Array<number>(6).fill(1)

	return (
		<div className='3xl:grid-cols-6 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3'>
			{isPending &&
				skeletonsArray.map((_, index) => (
					<Skeleton
						className='h-20 rounded-2xl'
						key={index}
					/>
				))}

			{data && (
				<>
					<DashboardStatisticItem
						icon={DollarSign}
						title={t('DASHBOARD.TOTALS.SALES')}
						value={`${data.sales.toLocaleString()}`}
					/>
					<DashboardStatisticItem
						icon={ShoppingBasket}
						title={t('DASHBOARD.TOTALS.PRODUCTS')}
						value={data.products.toString()}
					/>
					<DashboardStatisticItem
						icon={ShoppingCart}
						title={t('DASHBOARD.TOTALS.ORDERS')}
						value={data.orders.toString()}
					/>
					<DashboardStatisticItem
						icon={ShoppingCart}
						title={t('DASHBOARD.TOTALS.ACTIVE_ORDERS')}
						value={data.activeOrders.toString()}
					/>
					<DashboardStatisticItem
						icon={CheckCircle}
						title={t('DASHBOARD.TOTALS.COMPLETED_ORDERS')}
						value={data.completedOrders.toString()}
					/>
					<DashboardStatisticItem
						icon={Users}
						title={t('DASHBOARD.TOTALS.MEMBERS')}
						value={data.members.toString()}
					/>
				</>
			)}
		</div>
	)
}
