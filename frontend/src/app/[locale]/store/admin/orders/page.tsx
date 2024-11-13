import { Metadata } from 'next'
import { Suspense } from 'react'

import { NO_INDEX_PAGE } from '@/core/constants/seo.constant'
import { OrdersDashboardPage } from '@/modules/admin/orders/pages/OrdersDashboardPage'

export const metadata: Metadata = {
	title: 'Заказы',
	...NO_INDEX_PAGE
}

export default function Page() {
	return (
		<Suspense>
			<OrdersDashboardPage />
		</Suspense>
	)
}
