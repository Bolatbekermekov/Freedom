import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { toast } from 'sonner'

import { ISubCategoryFilter } from '../models/sub-category-dto.model'
import { adminSubCategoriesAPIService } from '../services/sub-categories-api.service'

import { getPagination } from '@/core/lib/pagination.utils'
import { Pageable } from '@/core/models/paginated.model'

interface UseAdminSubCategoriesProps {
	pagination: Partial<Pageable>
	filter: Partial<ISubCategoryFilter>
}

export function useAdminSubCategories({
	pagination,
	filter
}: UseAdminSubCategoriesProps) {
	const result = useQuery({
		queryKey: ['admin-sub-categories', { ...pagination, ...filter }],
		queryFn: () =>
			adminSubCategoriesAPIService.getSubCategories(
				getPagination(pagination),
				filter
			)
	})

	useEffect(() => {
		if (result.error) {
			toast.error(result.error?.message ?? 'Failed to get sub categories')
		}
	}, [result.error])

	return result
}
