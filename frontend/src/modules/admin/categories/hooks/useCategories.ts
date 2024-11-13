import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { toast } from 'sonner'

import { ICategoryFilter } from '../models/category-dto.model'
import { adminCategoriesAPIService } from '../services/admin-categories-api.service'

import { getPagination } from '@/core/lib/pagination.utils'
import { Pageable } from '@/core/models/paginated.model'

interface UseAdminCategoriesProps {
	pagination: Partial<Pageable>
	filter: Partial<ICategoryFilter>
}

export function useAdminCategories({
	pagination,
	filter
}: UseAdminCategoriesProps) {
	const result = useQuery({
		queryKey: ['admin-categories', { ...pagination, ...filter }],
		queryFn: () =>
			adminCategoriesAPIService.getCategories(getPagination(pagination), filter)
	})

	useEffect(() => {
		if (result.error) {
			toast.error(result.error?.message ?? 'Failed to get categories')
		}
	}, [result.error])

	return result
}
