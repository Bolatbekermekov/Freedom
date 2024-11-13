'use client'

import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Area, AreaChart, CartesianGrid, LabelList, XAxis } from 'recharts'

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
	ChartTooltip,
	ChartTooltipContent
} from '@/core/ui/chart'
import { Skeleton } from '@/core/ui/skeleton'

const initialChartConfig = {
	customers: {
		label: 'MONITORING.PLATFORM_METRICS.REGISTERED_USERS_GRAPH.LABEL',
		color: 'var(--primary)'
	}
} satisfies ChartConfig

export function CustomersFlowGraph() {
	const { t } = useTranslation()

	const chartConfig = {
		...initialChartConfig,
		customers: {
			...initialChartConfig.customers,
			label: t(initialChartConfig.customers.label)
		}
	}

	const { data: chartData, isPending: isChartDataPending } = useQuery({
		queryKey: ['get-registered-users-by-month'],
		queryFn: () => monitoringApiService.getRegisteredUsersByMonth()
	})

	return (
		<>
			{isChartDataPending && <Skeleton className='h-full w-full rounded-2xl' />}
			{chartData && (
				<Card className='rounded-2xl border-none'>
					<CardHeader>
						<CardTitle>
							{t('MONITORING.PLATFORM_METRICS.REGISTERED_USERS_GRAPH.LABEL')}
						</CardTitle>
						<CardDescription>
							{t(
								'MONITORING.PLATFORM_METRICS.REGISTERED_USERS_GRAPH.DESCRIPTION'
							)}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<ChartContainer
							config={chartConfig}
							className='mt-5 min-h-full w-full'
						>
							<AreaChart
								accessibilityLayer
								data={chartData}
								margin={{
									left: 12,
									right: 12
								}}
							>
								<CartesianGrid vertical={false} />
								<XAxis
									dataKey='label'
									tickLine={false}
									axisLine={false}
									tickMargin={8}
									minTickGap={82}
									tickFormatter={value => value.slice(0, 3)}
								/>

								<ChartTooltip
									cursor={false}
									content={<ChartTooltipContent />}
								/>

								<defs>
									<linearGradient
										id='fillCustomers'
										x1='0'
										y1='0'
										x2='0'
										y2='1'
									>
										<stop
											offset='5%'
											stopColor='var(--color-customers)'
											stopOpacity={0.8}
										/>
										<stop
											offset='95%'
											stopColor='var(--color-customers)'
											stopOpacity={0.1}
										/>
									</linearGradient>
								</defs>
								<Area
									dataKey='value'
									type='bump'
									fill='url(#fillCustomers)'
									fillOpacity={0.4}
									stroke='var(--color-customers)'
									stackId='a'
									dot={{
										fill: 'var(--color-customers)'
									}}
									activeDot={{
										r: 6
									}}
								>
									<LabelList
										position='top'
										offset={12}
										className='fill-foreground'
										fontSize={12}
									/>
								</Area>
							</AreaChart>
						</ChartContainer>
					</CardContent>
				</Card>
			)}
		</>
	)
}
