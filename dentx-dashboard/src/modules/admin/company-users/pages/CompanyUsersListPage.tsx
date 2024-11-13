'use client'

import { parseAsInteger, useQueryState } from 'nuqs'
import { useCallback } from 'react'

import { CompanyUsersDashboardToolbar } from '../components/company-users/CompanyUsersDashboardToolbar'
import { CompanyUsersFilter } from '../components/company-users/CompanyUsersFilter'
import { CompanyUsersTableView } from '../components/company-users/views/CompanyUsersTableView'
import { useCompanyUsers } from '../hooks/useCompanyUsers'
import { ICompanyUsersFilter } from '../models/company-users-dto.model'

import { CustomPagination } from '@/core/components/CustomPagination'
import { getPagination } from '@/core/lib/pagination.utils'
import { INITIAL_PAGINATION, Pageable } from '@/core/models/paginated.model'
import { Skeleton } from '@/core/ui/skeleton'

export const CompanyUsersListPage = () => {
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

	const { refetch, data, isPending, isRefetching } = useCompanyUsers({
		pagination: {
			page: pageParams,
			size: sizeParams,
			paginate: true
		},
		filter: {
			searchValue: searchValueParams ?? undefined,
			sort: sortParams ?? undefined,
			view: viewParams ?? undefined
		}
	})

	const onPageChange = useCallback(
		(pageable: Pageable) => {
			const updatedPagination = getPagination(pageable)
			setPageParams(updatedPagination.page)
			setSizeParams(updatedPagination.size)
		},
		[setPageParams, setSizeParams]
	)

	const onFilterChange = useCallback(
		(newFilter: ICompanyUsersFilter) => {
			setSearchValueParams(newFilter.searchValue ?? null)
			setSortParams(newFilter.sort ?? null)
			setViewParams(newFilter.view ?? null)

			onPageChange(INITIAL_PAGINATION)
		},
		[onPageChange, setSearchValueParams, setSortParams, setViewParams]
	)

	return (
		<div>
			<div>
				<CompanyUsersDashboardToolbar refetch={refetch} />
			</div>

			<div className='mt-6'>
				<CompanyUsersFilter
					filter={{
						searchValue: searchValueParams ?? undefined,
						sort: sortParams ?? undefined,
						view: viewParams ?? undefined
					}}
					onFilterChange={onFilterChange}
				/>
			</div>

			{(isPending || isRefetching) && (
				<Skeleton className='mt-4 h-[500px] w-full rounded-2xl' />
			)}

			{data && !isPending && !isRefetching && (
				<>
					<div className='mt-4'>
						<CompanyUsersTableView users={data?.docs ?? []} />
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
