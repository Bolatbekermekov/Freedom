import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { toast } from 'sonner'

import { IOrdersFilter } from '../models/orders-dto.model'
import { adminOrdersAPIService } from '../services/orders-api.service'

import { getPagination } from '@/core/lib/pagination.utils'
import { Pageable } from '@/core/models/paginated.model'

interface UseOrdersProps {
	pagination: Partial<Pageable>
	filter: Partial<IOrdersFilter>
}

export const useAdminOrders = ({ pagination, filter }: UseOrdersProps) => {
	const result = useQuery({
		queryKey: ['admin-orders', { ...pagination, ...filter }],
		queryFn: () =>
			adminOrdersAPIService.getOrders(getPagination(pagination), filter)
	})

	useEffect(() => {
		if (result.error) {
			toast.error(result.error?.message ?? 'Failed to get orders')
		}
	}, [result.error])

	return result
}
