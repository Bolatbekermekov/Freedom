'use client'

import { ProductsList } from '@/modules/products/components/ProductCard'
import { ProductsSkeletonsList } from '@/modules/products/components/ProductsSkeletonsList'
import { useProducts } from '@/modules/products/hooks/useProducts'

export function HomePage() {
	const { data: products, isPending } = useProducts({})

	return (
		<section className='mt-4'>
			{isPending && <ProductsSkeletonsList />}
			{products && <ProductsList products={products.slice(0, 20)} />}
		</section>
	)
}
