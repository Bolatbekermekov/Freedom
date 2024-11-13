import { Metadata } from 'next'

import { NO_INDEX_PAGE } from '@/core/constants/seo.constant'
import { MonitoringDashboardPage } from '@/modules/admin/monitoring/pages/MonitoringDashboardPage'

export const metadata: Metadata = {
	title: 'Мониторинг',
	...NO_INDEX_PAGE
}

export default async function Page() {
	return <MonitoringDashboardPage />
}
