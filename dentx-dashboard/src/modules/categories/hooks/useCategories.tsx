import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { toast } from 'sonner'

import { CategoryFilterDTO } from '../models/categories-filter.model'
import { categoriesAPIService } from '../services/categories-api.service'

interface UseCategoriesProps {
	enabled?: boolean
	filter?: CategoryFilterDTO
}

export const useCategories = (props?: UseCategoriesProps) => {
	const result = useQuery({
		queryKey: ['get_categories'],
		queryFn: () => categoriesAPIService.getCategories(props?.filter),
		...props
	})

	useEffect(() => {
		if (result.error) {
			toast.error(result.error?.message ?? 'Failed to get products')
		}
	}, [result.error])

	return result
}
