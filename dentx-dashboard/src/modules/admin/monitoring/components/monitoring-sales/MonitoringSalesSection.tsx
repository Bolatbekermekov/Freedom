'use client'

import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { MonitoringSalesDashboardToolbar } from './SalesDashboardToolbar'
import { SalesMetrics } from './SalesMetrics'
import { SalesStatistics } from './SalesStatistics'

export const MonitoringSalesSection = () => {
	const { t } = useTranslation()

	const [selectedStoreId, setSelectedStoreId] = useState<string | undefined>(
		undefined
	)

	const onSelectStoreId = useCallback((storeId: string | undefined) => {
		setSelectedStoreId(storeId)
	}, [])

	return (
		<div>
			<MonitoringSalesDashboardToolbar
				selectedStoreId={selectedStoreId}
				onSelectStoreId={onSelectStoreId}
			/>

			<div className='mt-6'>
				{!selectedStoreId && (
					<p className='text-slate-500'>
						{t('MONITORING.STORES_METRICS.EMPTY')}
					</p>
				)}

				{selectedStoreId && (
					<div className='mt-6'>
						<SalesMetrics storeId={selectedStoreId} />
						<div className='mt-5'>
							<SalesStatistics storeId={selectedStoreId} />
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
