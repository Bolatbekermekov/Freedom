'use client'

import { parseAsInteger, useQueryState } from 'nuqs'
import { memo, useCallback, useState } from 'react'

import { CategoriesDashboardToolbar } from '../components/CategoriesDashboardToolbar'
import { CategoriesFilter } from '../components/CategoriesFilter'
import { CategoriesTableView } from '../components/views/CategoriesTableView'
import { useAdminCategories } from '../hooks/useCategories'
import { ICategoryFilter } from '../models/category-dto.model'

import { CustomPagination } from '@/core/components/CustomPagination'
import { getPagination } from '@/core/lib/pagination.utils'
import { INITIAL_PAGINATION, Pageable } from '@/core/models/paginated.model'
import { Skeleton } from '@/core/ui/skeleton'

export const CategoriesListPage = memo(() => {
	const [pageParams, setPageParams] = useQueryState(
		'page',
		parseAsInteger.withDefault(INITIAL_PAGINATION.page)
	)
	const [sizeParams, setSizeParams] = useQueryState(
		'size',
		parseAsInteger.withDefault(INITIAL_PAGINATION.size)
	)
	const [searchValueParams, setSearchValueParams] = useQueryState('searchValue')
	const [sortParams, setSortParams] = useQueryState('sort')
	const [viewParams, setViewParams] = useQueryState('view')

	const [pagination, setPagination] = useState<Pageable>(
		getPagination({
			paginate: true,
			page: pageParams,
			size: sizeParams
		})
	)

	const [filter, setFilter] = useState<ICategoryFilter>(() => ({
		searchValue: searchValueParams ?? undefined,
		sort: sortParams ?? undefined,
		view: viewParams ?? undefined
	}))

	const { refetch, data, isPending, isRefetching } = useAdminCategories({
		pagination,
		filter
	})

	const onPageChange = useCallback(
		(pageable: Pageable) => {
			const updatedPagination = getPagination(pageable)
			setPageParams(updatedPagination.page)
			setSizeParams(updatedPagination.size)
			setPagination(updatedPagination)
		},
		[setPageParams, setSizeParams]
	)

	const onFilterChange = useCallback(
		(newFilter: ICategoryFilter) => {
			setSearchValueParams(newFilter.searchValue ?? null)
			setSortParams(newFilter.sort ?? null)
			setViewParams(newFilter.view ?? null)
			onPageChange(INITIAL_PAGINATION)
			setFilter(newFilter)
		},
		[onPageChange, setSearchValueParams, setSortParams, setViewParams]
	)

	return (
		<div>
			<div>
				<CategoriesDashboardToolbar refetch={refetch} />
			</div>

			<div className='mt-6'>
				<CategoriesFilter
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
						<CategoriesTableView categories={data?.docs ?? []} />
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

CategoriesListPage.displayName = 'CategoriesListPage'
