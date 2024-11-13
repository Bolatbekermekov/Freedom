import { Metadata } from 'next'

import { NO_INDEX_PAGE } from '@/core/constants/seo.constant'
import DashboardPage from '@/modules/admin/dashboard/pages/DashboardPage'

export const metadata: Metadata = {
	title: 'Аналитика',
	...NO_INDEX_PAGE
}

export default function Page() {
	return <DashboardPage />
}
