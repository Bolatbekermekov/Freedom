'use client'

import { useQuery } from '@tanstack/react-query'
import { Locale, format, parseISO } from 'date-fns'
import { enUS, kk, ru } from 'date-fns/locale'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

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
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue
} from '@/core/ui/select'
import { Skeleton } from '@/core/ui/skeleton'

export enum SALES_PERIODS {
	ONE_DAY = 'ONE_DAY',
	FIVE_DAYS = 'FIVE_DAYS',
	ONE_MONTH = 'ONE_MONTH',
	SIX_MONTHS = 'SIX_MONTHS',
	MAX = 'MAX'
}

const SALES_TYPES = [
	{
		title: 'MONITORING.STORES_METRICS.REVENUE_GRAPH.PERIODS.ONE_DAY',
		value: SALES_PERIODS.ONE_DAY
	},
	{
		title: 'MONITORING.STORES_METRICS.REVENUE_GRAPH.PERIODS.FIVE_DAYS',
		value: SALES_PERIODS.FIVE_DAYS
	},
	{
		title: 'MONITORING.STORES_METRICS.REVENUE_GRAPH.PERIODS.ONE_MONTH',
		value: SALES_PERIODS.ONE_MONTH
	},
	{
		title: 'MONITORING.STORES_METRICS.REVENUE_GRAPH.PERIODS.SIX_MONTHS',
		value: SALES_PERIODS.SIX_MONTHS
	},
	{
		title: 'MONITORING.STORES_METRICS.REVENUE_GRAPH.PERIODS.MAX',
		value: SALES_PERIODS.MAX
	}
]

const chartConfig = {
	sales: {
		label: 'Sales',
		color: 'var(--primary)'
	}
} satisfies ChartConfig

interface SalesLineChartProps {
	storeId: string
}

const locales: Record<string, Locale> = {
	en: enUS,
	ru: ru,
	kz: kk
}

export function SalesLineChart({ storeId }: SalesLineChartProps) {
	const { t, i18n } = useTranslation()

	const [selectedPeriodType, setSelectedPeriodType] = useState<SALES_PERIODS>(
		SALES_PERIODS.ONE_MONTH
	)

	const { data: chartData, isPending: isChartDataPending } = useQuery({
		queryKey: ['get-sales-by-period-type', { storeId, selectedPeriodType }],
		queryFn: () =>
			monitoringApiService.getSalesByPeriodType(storeId, selectedPeriodType)
	})

	const onPeriodTypeChange = useCallback((v: SALES_PERIODS) => {
		setSelectedPeriodType(v)
	}, [])

	const onTickFormat = useCallback(
		(v: string) => {
			const locale = locales[i18n.language]
			const date = parseISO(v)

			switch (selectedPeriodType) {
				case SALES_PERIODS.ONE_DAY:
					return format(date, 'HH:mm', { locale })
				case SALES_PERIODS.FIVE_DAYS:
				case SALES_PERIODS.ONE_MONTH:
					return format(date, 'do MMM', { locale })
				case SALES_PERIODS.SIX_MONTHS:
					return format(date, 'MMM yyyy', { locale })
				case SALES_PERIODS.MAX:
					return format(date, 'yyyy', { locale })
				default:
					return v
			}
		},
		[i18n.language, selectedPeriodType]
	)

	const renderedOptions = useMemo(() => {
		return SALES_TYPES.map(type => (
			<SelectItem
				key={type.value}
				value={type.value}
			>
				{t(type.title)}
			</SelectItem>
		))
	}, [t])

	return (
		<>
			{isChartDataPending && <Skeleton className='h-full w-full rounded-2xl' />}
			{!isChartDataPending && chartData && (
				<Card className='rounded-2xl border-none md:h-full'>
					<CardHeader>
						<div className='flex items-center justify-between gap-4'>
							<div>
								<CardTitle>
									{t('MONITORING.STORES_METRICS.REVENUE_GRAPH.LABEL')}
								</CardTitle>
								<CardDescription className='mt-2'>
									{t('MONITORING.STORES_METRICS.REVENUE_GRAPH.DESCRIPTION')}
								</CardDescription>
							</div>

							<Select
								value={selectedPeriodType}
								onValueChange={onPeriodTypeChange}
							>
								<SelectTrigger className='w-fit border border-slate-300 bg-transparent'>
									<SelectValue
										placeholder={t(
											'MONITORING.STORES_METRICS.REVENUE_GRAPH.PERIODS.PLACEHOLDER'
										)}
									/>
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										<SelectLabel>
											{t(
												'MONITORING.STORES_METRICS.REVENUE_GRAPH.PERIODS.PLACEHOLDER'
											)}
										</SelectLabel>
										{renderedOptions}
									</SelectGroup>
								</SelectContent>
							</Select>
						</div>
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
									minTickGap={100}
									tickFormatter={onTickFormat}
								/>

								<YAxis
									dataKey='value'
									tickLine={false}
									axisLine={false}
									tickCount={4}
								/>

								<ChartTooltip
									cursor={false}
									content={
										<ChartTooltipContent labelFormatter={onTickFormat} />
									}
								/>
								<defs>
									<linearGradient
										id='fillSales'
										x1='0'
										y1='0'
										x2='0'
										y2='1'
									>
										<stop
											offset='5%'
											stopColor='var(--color-sales)'
											stopOpacity={0.8}
										/>
										<stop
											offset='95%'
											stopColor='var(--color-sales)'
											stopOpacity={0.1}
										/>
									</linearGradient>
								</defs>

								<Area
									dataKey='value'
									type='bump'
									fill='url(#fillSales)'
									fillOpacity={0.4}
									stroke='var(--color-sales)'
									stackId='a'
									dot={{
										fill: 'var(--color-sales)'
									}}
									activeDot={{
										r: 6
									}}
								/>
							</AreaChart>
						</ChartContainer>
					</CardContent>
				</Card>
			)}
		</>
	)
}
