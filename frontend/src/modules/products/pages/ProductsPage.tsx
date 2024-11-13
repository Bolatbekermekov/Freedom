'use client'

import { useSearchParams } from 'next/navigation'

import { ProductsList } from '../components/ProductCard'
import { ProductsSkeletonsList } from '../components/ProductsSkeletonsList'
import { useProducts } from '../hooks/useProducts'

export const ProductsPage = () => {
	const searchParams = useSearchParams()

	const { data: products, isPending } = useProducts({
		filter: {
			searchValue: searchParams.get('searchValue') ?? undefined,
			sort: searchParams.get('sort') ?? undefined,
			subCategoryId: searchParams.get('subCategoryId') ?? undefined,
			companyId: searchParams.get('companyId') ?? undefined,
			minPrice: searchParams.get('minPrice') ?? undefined,
			maxPrice: searchParams.get('maxPrice') ?? undefined
		}
	})

	return (
		<>
			{searchParams.get('searchValue') && (
				<div className='px-4 py-4'>
					<p className='text-sm font-medium sm:text-base'>
						По запросу{' '}
						<span className='font-bold lowercase'>
							{searchParams.get('searchValue')}
						</span>{' '}
						найдено {products?.length ?? 0} товаров
					</p>
				</div>
			)}

			<div className='mt-4 px-4'>
				{products && <ProductsList products={products} />}
				{isPending && <ProductsSkeletonsList />}
			</div>
		</>
	)
}
