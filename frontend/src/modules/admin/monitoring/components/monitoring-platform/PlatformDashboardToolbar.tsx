'use client'

import { memo } from 'react'
import { useTranslation } from 'react-i18next'

export const MonitoringPlatformDashboardToolbar = memo(() => {
	const { t } = useTranslation()

	return (
		<div className='flex items-center justify-between'>
			<h2 className='text-2xl font-medium'>
				{t('MONITORING.PLATFORM_METRICS.LABEL')}
			</h2>
		</div>
	)
})

MonitoringPlatformDashboardToolbar.displayName =
	'MonitoringPlatformDashboardToolbar'
