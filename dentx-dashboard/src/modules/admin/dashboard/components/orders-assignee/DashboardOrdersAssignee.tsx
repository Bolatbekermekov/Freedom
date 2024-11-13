'use client'

import { useQuery } from '@tanstack/react-query'
import {
	BarElement,
	CategoryScale,
	Chart as ChartJS,
	Legend,
	LinearScale,
	Title,
	Tooltip
} from 'chart.js'
import { memo, useCallback, useMemo, useState } from 'react'
import { Bar } from 'react-chartjs-2'
import { useTranslation } from 'react-i18next'

import { AnalyticsPeriodTypes } from '../../models/totals.dto'
import { DashboardAPIService } from '../../services/admin-dashboard.service'
import { DashboardPeriodsSelector } from '../PeriodsSelector'

import { Skeleton } from '@/core/ui/skeleton'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export const options = {
	responsive: true,
	plugins: {
		legend: {
			position: 'bottom' as const
		}
	},
	maintainAspectRatio: false
}

export const DashboardOrdersAssignee = memo(() => {
	const { t } = useTranslation()

	const [periodType, setPeriodType] = useState<AnalyticsPeriodTypes>(
		AnalyticsPeriodTypes.MONTHLY
	)

	const { data, isPending } = useQuery({
		queryKey: ['analytics-orders-assignee', periodType],
		queryFn: () =>
			DashboardAPIService.getAssignedOrdersAnalytics({
				periodType
			})
	})

	const chartData = useMemo(
		() => ({
			labels: data?.map(d => d.user),
			datasets: [
				{
					label: t('DASHBOARD.ASSIGNEES_BY_ORDERS.LABEL'),
					data: data?.map(d => d.orders),
					borderColor: '#4318ff',
					backgroundColor: '#4318ff'
				}
			]
		}),
		[data, t]
	)

	const onPeriodTypeChange = useCallback((type: AnalyticsPeriodTypes) => {
		setPeriodType(type)
	}, [])

	return (
		<>
			{isPending && <Skeleton className='h-52 w-full' />}
			{data && (
				<div className='relative rounded-2xl bg-white p-6'>
					<div className='flex flex-wrap items-start justify-between gap-4'>
						<div>
							<h4 className='text-xl font-bold'>
								{t('DASHBOARD.ASSIGNEES_BY_ORDERS.LABEL')}
							</h4>
							<p className='mt-1 text-sm'>
								{t('DASHBOARD.ASSIGNEES_BY_ORDERS.SUBTITLE')}
							</p>
						</div>

						<div>
							<DashboardPeriodsSelector
								periodType={periodType}
								onPeriodTypeChange={onPeriodTypeChange}
							/>
						</div>
					</div>

					<div className='mt-6  h-[200px]'>
						<Bar
							options={options}
							data={chartData}
						/>
					</div>
				</div>
			)}
		</>
	)
})

DashboardOrdersAssignee.displayName = 'DashboardOrdersAssignee'
