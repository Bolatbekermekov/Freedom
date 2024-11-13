'use client'

import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from 'recharts'

import { monitoringApiService } from '../../services/monitoring-api.service'

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from '@/core/ui/card'
import {
	ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent
} from '@/core/ui/chart'
import { Skeleton } from '@/core/ui/skeleton'

const initialChartConfig = {
	createdOrders: {
		label: 'MONITORING.PLATFORM_METRICS.CREATED_AND_COMPLETED_ORDERS.CREATED',
		color: '#7a5eff'
	},
	completedOrders: {
		label: 'MONITORING.PLATFORM_METRICS.CREATED_AND_COMPLETED_ORDERS.COMPLETED',
		color: '#5ea1ff'
	}
} satisfies ChartConfig

export function SalesFlowGraph() {
	const { t } = useTranslation()

	const chartConfig = {
		...initialChartConfig,
		createdOrders: {
			...initialChartConfig.createdOrders,
			label: t(initialChartConfig.createdOrders.label)
		},
		completedOrders: {
			...initialChartConfig.completedOrders,
			label: t(initialChartConfig.completedOrders.label)
		}
	}

	const { data: createdOrdersData, isPending: isCreatedOrdersDataPending } =
		useQuery({
			queryKey: ['get-created-orders-by-month'],
			queryFn: () => monitoringApiService.getCreatedOrdersByMonth()
		})

	const { data: completedOrdersData, isPending: isCompletedOrdersDataPending } =
		useQuery({
			queryKey: ['get-completed-orders-by-month'],
			queryFn: () => monitoringApiService.getCompletedOrdersByMonth()
		})

	const chartData = useMemo(
		() =>
			createdOrdersData?.map(item => {
				return {
					label: item.label,
					createdOrders: item.value,
					completedOrders:
						completedOrdersData?.find(
							completedItem => completedItem.label === item.label
						)?.value ?? 0
				}
			}),
		[completedOrdersData, createdOrdersData]
	)

	return (
		<>
			{(isCreatedOrdersDataPending || isCompletedOrdersDataPending) && (
				<Skeleton className='h-full w-full rounded-2xl' />
			)}
			{createdOrdersData && completedOrdersData && (
				<Card className='rounded-2xl border-none'>
					<CardHeader>
						<CardTitle>
							{t(
								'MONITORING.PLATFORM_METRICS.CREATED_AND_COMPLETED_ORDERS.LABEL'
							)}
						</CardTitle>
						<CardDescription>
							{t(
								'MONITORING.PLATFORM_METRICS.CREATED_AND_COMPLETED_ORDERS.DESCRIPTION'
							)}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<ChartContainer
							config={chartConfig}
							className='mt-5 min-h-full w-full'
						>
							<BarChart
								accessibilityLayer
								data={chartData}
							>
								<CartesianGrid vertical={false} />
								<XAxis
									dataKey='label'
									tickLine={false}
									tickMargin={8}
									minTickGap={82}
									axisLine={false}
									tickFormatter={value => value.slice(0, 3)}
								/>

								<ChartTooltip content={<ChartTooltipContent />} />
								<ChartLegend content={<ChartLegendContent />} />

								<Bar
									dataKey='createdOrders'
									fill='var(--color-createdOrders)'
									radius={4}
								>
									<LabelList
										position='top'
										offset={12}
										className='fill-foreground'
										fontSize={12}
									/>
								</Bar>
								<Bar
									dataKey='completedOrders'
									fill='var(--color-completedOrders)'
									radius={4}
								>
									<LabelList
										position='top'
										offset={12}
										className='fill-foreground'
										fontSize={12}
									/>
								</Bar>
							</BarChart>
						</ChartContainer>
					</CardContent>
				</Card>
			)}
		</>
	)
}
