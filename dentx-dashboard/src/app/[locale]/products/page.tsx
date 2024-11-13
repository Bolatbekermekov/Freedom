import { Metadata } from 'next'
import { Suspense } from 'react'

import PrimaryLayout from '@/core/layouts/primary/PrimaryLayout'
import { ProductsPage } from '@/modules/products/pages/ProductsPage'

export const metadata: Metadata = {
	title: 'Товары'
}

export default async function Page() {
	return (
		<Suspense>
			<PrimaryLayout>
				<ProductsPage />
			</PrimaryLayout>
		</Suspense>
	)
}
