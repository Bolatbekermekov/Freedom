'use client'

import { parseAsInteger, useQueryState } from 'nuqs'
import { useCallback, useState } from 'react'

import { UsersDashboardToolbar } from '../components/users/UsersDashboardToolbar'
import { UsersFilter } from '../components/users/UsersFilter'
import { UsersTableView } from '../components/users/views/UsersTableView'
import { useAdminUsers } from '../hooks/useUsers'
import { UsersFilterDTO } from '../models/users-dto.model'

import { CustomPagination } from '@/core/components/CustomPagination'
import { getPagination } from '@/core/lib/pagination.utils'
import { INITIAL_PAGINATION, Pageable } from '@/core/models/paginated.model'
import { Skeleton } from '@/core/ui/skeleton'

export const UsersListPage = () => {
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

	const [filter, setFilter] = useState<UsersFilterDTO>(() => ({
		searchValue: searchValueParams ?? undefined,
		sort: sortParams ?? undefined,
		view: viewParams ?? undefined
	}))

	const { refetch, data, isPending, isRefetching } = useAdminUsers({
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
		(newFilter: UsersFilterDTO) => {
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
			<UsersDashboardToolbar refetch={refetch} />

			<div className='mt-6'>
				<UsersFilter
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
						<UsersTableView users={data?.docs ?? []} />
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
}
