'use client'

import { useQuery } from '@tanstack/react-query'
import { memo, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue
} from '@/core/ui/select'
import { companiesService } from '@/modules/store/services/store.service'

interface MonitoringSalesDashboardToolbarProps {
	selectedStoreId?: string
	onSelectStoreId: (storeId: string | undefined) => void
}

export const MonitoringSalesDashboardToolbar = memo(
	({
		selectedStoreId,
		onSelectStoreId
	}: MonitoringSalesDashboardToolbarProps) => {
		const { t } = useTranslation()

		const { data } = useQuery({
			queryKey: ['stores-list'],
			queryFn: () => companiesService.getStores()
		})

		const renderedOptions = useMemo(() => {
			return data?.map(store => (
				<SelectItem
					key={store._id}
					value={store._id}
				>
					{store.name}
				</SelectItem>
			))
		}, [data])

		const onStoreValueChange = useCallback(
			(v: string | undefined) => {
				onSelectStoreId(v)
			},
			[onSelectStoreId]
		)

		return (
			<div className='flex items-center justify-between'>
				<div className='flex flex-1 items-center gap-6'>
					<h2 className='text-2xl font-medium'>
						{t('MONITORING.STORES_METRICS.LABEL')}
					</h2>

					<Select
						value={selectedStoreId}
						onValueChange={onStoreValueChange}
					>
						<SelectTrigger className=' max-w-fit border border-slate-300'>
							<SelectValue
								placeholder={t('MONITORING.STORES_METRICS.STORES')}
							/>
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectLabel>
									{t('MONITORING.STORES_METRICS.STORES')}
								</SelectLabel>
								{renderedOptions}
							</SelectGroup>
						</SelectContent>
					</Select>
				</div>
			</div>
		)
	}
)

MonitoringSalesDashboardToolbar.displayName = 'MonitoringSalesDashboardToolbar'
