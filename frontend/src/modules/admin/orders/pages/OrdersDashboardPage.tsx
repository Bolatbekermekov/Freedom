'use client'

import { parseAsInteger, useQueryState } from 'nuqs'
import { useCallback, useState } from 'react'

import { OrdersDashboardToolbar } from '../components/order-dashboard/OrdersDashboardToolbar'
import { OrdersFilter } from '../components/order-dashboard/OrdersFilter'
import { OrdersTableView } from '../components/views/table/OrdersTableView'
import { useAdminOrders } from '../hooks/useOrders'
import { IOrdersFilter } from '../models/orders-dto.model'
import { ORDER_STATUSES } from '../models/orders.model'

import { CustomPagination } from '@/core/components/CustomPagination'
import { getPagination } from '@/core/lib/pagination.utils'
import { INITIAL_PAGINATION, Pageable } from '@/core/models/paginated.model'
import { Skeleton } from '@/core/ui/skeleton'

export const OrdersDashboardPage = () => {
	const [pageParams, setPageParams] = useQueryState(
		'o_page',
		parseAsInteger
			.withDefault(INITIAL_PAGINATION.page)
			.withOptions({ history: 'push', clearOnDefault: true })
	)
	const [sizeParams, setSizeParams] = useQueryState(
		'o_size',
		parseAsInteger
			.withDefault(INITIAL_PAGINATION.size)
			.withOptions({ history: 'push', clearOnDefault: true })
	)
	const [searchValueParams, setSearchValueParams] = useQueryState(
		'o_searchValue',
		{ history: 'push', clearOnDefault: true }
	)
	const [sortParams, setSortParams] = useQueryState('o_sort', {
		history: 'push',
		clearOnDefault: true
	})
	const [statusParams, setStatusParams] = useQueryState('o_status', {
		history: 'push',
		clearOnDefault: true
	})
	const [viewParams, setViewParams] = useQueryState('o_view', {
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

	const [filter, setFilter] = useState<IOrdersFilter>({
		searchValue: searchValueParams ?? undefined,
		sort: sortParams ?? undefined,
		view: viewParams ?? undefined,
		status: Object.values(ORDER_STATUSES).includes(
			statusParams as ORDER_STATUSES
		)
			? (statusParams as ORDER_STATUSES)
			: undefined
	})

	const { data, isPending, refetch, isRefetching } = useAdminOrders({
		pagination,
		filter
	})

	const onPageChange = useCallback(
		(pageable: Pageable) => {
			const pagination = getPagination(pageable)

			setPageParams(pagination.page)
			setSizeParams(pagination.size)

			setPagination(pagination)
		},
		[setPageParams, setSizeParams]
	)

	const onFilterChange = useCallback(
		(filter: IOrdersFilter) => {
			setSearchValueParams(filter.searchValue ?? null)
			setSortParams(filter.sort ?? null)
			setViewParams(filter.view ?? null)
			setStatusParams(filter.status ?? null)

			setFilter(filter)
			onPageChange(INITIAL_PAGINATION)
		},
		[
			onPageChange,
			setSearchValueParams,
			setSortParams,
			setStatusParams,
			setViewParams
		]
	)

	return (
		<div>
			{/* <OrdersDashboardStatistics /> */}

			<OrdersDashboardToolbar refetch={refetch} />

			<div className='mt-6'>
				<OrdersFilter
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
						<OrdersTableView orders={data?.docs ?? []} />
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
