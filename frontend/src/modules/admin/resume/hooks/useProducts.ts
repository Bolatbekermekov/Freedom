import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { toast } from 'sonner'

import { IProductsFilter } from '../models/product-dto.model'
import { adminProductsAPIService } from '../services/products-api.service'

import { getPagination } from '@/core/lib/pagination.utils'
import { Pageable } from '@/core/models/paginated.model'

interface UseAdminProductsProps {
	pagination: Partial<Pageable>
	filter: Partial<IProductsFilter>
}

export const useAdminProducts = ({
	pagination,
	filter
}: UseAdminProductsProps) => {
	const result = useQuery({
		queryKey: ['admin-products', { ...pagination, ...filter }],
		queryFn: () =>
			adminProductsAPIService.getProducts(getPagination(pagination), filter)
	})

	useEffect(() => {
		if (result.error) {
			toast.error(result.error?.message ?? 'Failed to get products')
		}
	}, [result.error])

	return { ...result }
}
