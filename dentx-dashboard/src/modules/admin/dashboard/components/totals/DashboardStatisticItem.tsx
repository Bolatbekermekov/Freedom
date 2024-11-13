import { LucideIcon } from 'lucide-react'

import { CustomTooltip } from '@/core/components/CustomTooltip'

interface DashboardStatisticItemProps {
	icon: LucideIcon
	title: string
	value: string
}

export const DashboardStatisticItem = (item: DashboardStatisticItemProps) => {
	return (
		<div className='shadow-3xl relative flex items-center gap-6 rounded-2xl bg-white p-4 shadow-black/20'>
			<div className='flex h-12 w-12 items-center justify-center rounded-full bg-secondary p-3'>
				<item.icon className='text-primary' />
			</div>

			<div className='max-w-[60%]'>
				<p className='text-t_light text-xs'>{item.title}</p>
				<CustomTooltip tooltip={item.value}>
					<p className='mt-[2px] truncate text-xl font-bold'>{item.value}</p>
				</CustomTooltip>
			</div>
		</div>
	)
}
