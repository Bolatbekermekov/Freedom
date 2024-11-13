import { LucideIcon } from 'lucide-react'

interface StatisticsItemProps {
	title: string
	value: string
	icon: LucideIcon
}

export const StatisticsItem = (item: StatisticsItemProps) => {
	return (
		<div className='flex items-center gap-5'>
			<div className='rounded-lg bg-secondary p-4 text-primary'>
				<item.icon size={22} />
			</div>
			<div>
				<p className='text-sm'>{item.title}</p>
				<p className='mt-1 text-2xl font-medium'>{item.value}</p>
			</div>
		</div>
	)
}
