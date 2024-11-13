import { LucideIcon, MoveDownRight, MoveUpRight } from 'lucide-react'
import { useMemo } from 'react'

import { CustomTooltip } from '@/core/components/CustomTooltip'
import { Skeleton } from '@/core/ui/skeleton'

interface AnalyticsCardProps {
	title: string
	value: string
	changePercentage?: number
	changeRateDescription?: string
	icon?: LucideIcon
	isLoading?: boolean
}

export const AnalyticsCard = (item: AnalyticsCardProps) => {
	const renderedChangeRate = useMemo(() => {
		if (!item.changePercentage) return null

		if (item.changePercentage < 0) {
			return (
				<div className='flex w-fit items-center gap-1 rounded-full bg-red-200 px-2 py-1 text-xs text-red-950'>
					<MoveDownRight size={14} />
					<p>{item.changePercentage}%</p>
				</div>
			)
		}

		return (
			<div className='flex w-fit items-center gap-1 rounded-full bg-green-200 px-2 py-1 text-xs text-green-950'>
				<MoveUpRight size={14} />
				<p>{item.changePercentage}%</p>
			</div>
		)
	}, [item.changePercentage])

	if (item?.isLoading) {
		return <Skeleton className='h-32 w-full rounded-2xl' />
	}

	return (
		<div className='relative h-full cursor-pointer rounded-2xl bg-white p-6'>
			<div className='flex items-center gap-2'>
				{item.icon && (
					<item.icon
						size={18}
						className='text-primary'
					/>
				)}
				<CustomTooltip tooltip={item.title}>
					<h3 className='truncate'>{item.title}</h3>
				</CustomTooltip>
			</div>

			<div className='mt-5 flex items-end gap-4'>
				<CustomTooltip tooltip={item.value}>
					<p className='fond-medium truncate text-4xl'>{item.value}</p>
				</CustomTooltip>
			</div>

			{renderedChangeRate && (
				<div className='mt-5 flex items-center gap-2 truncate'>
					{renderedChangeRate}

					{item.changeRateDescription && (
						<p className='text-sm'>{item.changeRateDescription}</p>
					)}
				</div>
			)}
		</div>
	)
}
