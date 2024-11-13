'use client'

import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { monitoringApiService } from '../../services/monitoring-api.service'
import { AnalyticsCard } from '../AnalyticsCard'

import { SalesLineChart } from './SalesLineChart'

interface SalesMetricsProps {
	storeId: string
}

export const SalesMetrics = ({ storeId }: SalesMetricsProps) => {
	const { t } = useTranslation()

	const { data: totalSales, isPending: isTotalSalesPending } = useQuery({
		queryKey: ['monitoring-store-total-sales', storeId],
		queryFn: () => monitoringApiService.getTotalSalesForCurrentMonth(storeId)
	})

	const { data: avgSales, isPending: isAvgSalesPending } = useQuery({
		queryKey: ['monitoring-store-avg-sales', storeId],
		queryFn: () =>
			monitoringApiService.getAverageDailySalesForCurrentMonth(storeId)
	})

	const { data: totalOrders, isPending: isTotalOrdersPending } = useQuery({
		queryKey: ['monitoring-store-total-orders', storeId],
		queryFn: () => monitoringApiService.getTotalOrdersForCurrentMonth(storeId)
	})

	return (
		<div className='grid auto-rows-fr grid-cols-3 gap-5'>
			<div className='col-span-full flex flex-col gap-4 md:col-span-1'>
				<AnalyticsCard
					title={t(
						'MONITORING.STORES_METRICS.STATISTICS.TOTAL_SALES_THIS_MONTH'
					)}
					value={`${totalSales?.value.toLocaleString()} ₸`}
					changePercentage={totalSales?.changeRate}
					changeRateDescription={t(
						'MONITORING.STORES_METRICS.STATISTICS.LAST_MONTH'
					)}
					isLoading={isTotalSalesPending}
				/>

				<AnalyticsCard
					title={t('MONITORING.STORES_METRICS.STATISTICS.AVG_SALES_THIS_MONTH')}
					value={`${avgSales?.value.toLocaleString()} ₸`}
					changePercentage={avgSales?.changeRate}
					changeRateDescription={t(
						'MONITORING.STORES_METRICS.STATISTICS.LAST_MONTH'
					)}
					isLoading={isAvgSalesPending}
				/>

				<AnalyticsCard
					title={t(
						'MONITORING.STORES_METRICS.STATISTICS.TOTAL_ORDERS_THIS_MONTH'
					)}
					value={`${totalOrders?.value.toLocaleString()}`}
					changePercentage={totalOrders?.changeRate}
					changeRateDescription={t(
						'MONITORING.STORES_METRICS.STATISTICS.LAST_MONTH'
					)}
					isLoading={isTotalOrdersPending}
				/>
			</div>

			<div className='col-span-full md:col-span-2'>
				<SalesLineChart storeId={storeId} />
			</div>
		</div>
	)
}
