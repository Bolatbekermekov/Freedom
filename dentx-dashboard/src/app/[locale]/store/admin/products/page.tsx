import { Metadata } from 'next'
import { Suspense } from 'react'

import { NO_INDEX_PAGE } from '@/core/constants/seo.constant'
import { ProductsListPage } from '@/modules/admin/products/pages/ProductsListPage'

export const metadata: Metadata = {
	title: 'Товары',
	...NO_INDEX_PAGE
}

export default function Page() {
	return (
		<Suspense>
			<ProductsListPage />
		</Suspense>
	)
}
