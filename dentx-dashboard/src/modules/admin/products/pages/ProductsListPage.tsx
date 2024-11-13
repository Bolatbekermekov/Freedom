'use client'

import { parseAsInteger, useQueryState } from 'nuqs'
import { memo, useCallback, useState } from 'react'

import { ProductsDashboardToolbar } from '../components/ProductsDashboardToolbar'
import { ProductsFilter } from '../components/ProductsFilter'
import { ProductsTableView } from '../components/views/ProductsTableView'
import { useAdminProducts } from '../hooks/useProducts'
import { IProductsFilter } from '../models/product-dto.model'

import { CustomPagination } from '@/core/components/CustomPagination'
import { getPagination } from '@/core/lib/pagination.utils'
import { INITIAL_PAGINATION, Pageable } from '@/core/models/paginated.model'
import { Skeleton } from '@/core/ui/skeleton'

export const ProductsListPage = memo(() => {
	const [pageParams, setPageParams] = useQueryState(
		'p_page',
		parseAsInteger
			.withDefault(INITIAL_PAGINATION.page)
			.withOptions({ history: 'push', clearOnDefault: true })
	)
	const [sizeParams, setSizeParams] = useQueryState(
		'p_size',
		parseAsInteger
			.withDefault(INITIAL_PAGINATION.size)
			.withOptions({ history: 'push', clearOnDefault: true })
	)
	const [searchValueParams, setSearchValueParams] = useQueryState(
		'p_searchValue',
		{ history: 'push', clearOnDefault: true }
	)
	const [subCategoryIdParams, setSubCategoryIdParams] = useQueryState(
		'p_subCategoryId',
		{ history: 'push', clearOnDefault: true }
	)
	const [sortParams, setSortParams] = useQueryState('p_sort', {
		history: 'push',
		clearOnDefault: true
	})
	const [viewParams, setViewParams] = useQueryState('p_view', {
		history: 'push',
		clearOnDefault: true
	})

	const [pagination, setPagination] = useState<Pageable>(
		getPagination({
			paginate: true,
			page: pageParams,
			size: sizeParams
		})
	)

	const [filter, setFilter] = useState<IProductsFilter>({
		searchValue: searchValueParams ?? undefined,
		subCategoryId: subCategoryIdParams ?? undefined,
		sort: sortParams ?? undefined,
		view: viewParams ?? undefined
	})

	const { data, isPending, refetch, isRefetching } = useAdminProducts({
		pagination: pagination,
		filter: filter
	})

	const onPageChange = useCallback(
		(pageable: Pageable) => {
			const newPagination = getPagination(pageable)

			setPageParams(newPagination.page)
			setSizeParams(newPagination.size)

			setPagination(newPagination)
		},
		[setPageParams, setSizeParams]
	)

	const onFilterChange = useCallback(
		(filter: IProductsFilter) => {
			setSearchValueParams(filter.searchValue ?? null)
			setSortParams(filter.sort ?? null)
			setViewParams(filter.view ?? null)
			setSubCategoryIdParams(filter.subCategoryId ?? null)

			setFilter(filter)
			onPageChange(INITIAL_PAGINATION)
		},
		[
			onPageChange,
			setSearchValueParams,
			setSortParams,
			setSubCategoryIdParams,
			setViewParams
		]
	)

	return (
		<div>
			{/* <ProductsDashboardStatistics /> */}

			<ProductsDashboardToolbar refetch={refetch} />

			<div className='mt-6'>
				<ProductsFilter
					filter={filter}
					onFilterChange={onFilterChange}
				/>
			</div>

			{(isPending || isRefetching) && (
				<Skeleton className='mt-4 h-[500px] w-full rounded-2xl' />
			)}

			{data && !isPending && !isRefetching && (
				<>
					<div className='mt-4'>
						<ProductsTableView products={data?.docs ?? []} />
					</div>

					<div className='mt-4'>
						<CustomPagination
							size={INITIAL_PAGINATION.size}
							page={data.page}
							prevPage={data.prevPage}
							nextPage={data.nextPage}
							onPageChange={onPageChange}
						/>
					</div>
				</>
			)}
		</div>
	)
})

ProductsListPage.displayName = 'ProductsListPage'
