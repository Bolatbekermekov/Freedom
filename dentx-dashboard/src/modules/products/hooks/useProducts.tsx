import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { toast } from 'sonner'

import { SearchProductsDTO } from '../models/products-dto.model'
import { ProductsAPIService } from '../services/products-api.service'

interface UseProductsProps {
	filter?: SearchProductsDTO
}

export const useProducts = ({ filter }: UseProductsProps) => {
	const result = useQuery({
		queryKey: ['get_products', { ...filter }],
		queryFn: () => ProductsAPIService.searchProducts(filter)
	})

	useEffect(() => {
		if (result.error) {
			toast.error(result.error?.message ?? 'Failed to get products')
		}
	}, [result.error])

	return result
}

export const useProduct = (productId: string) => {
	const result = useQuery({
		queryKey: ['get_product'],
		queryFn: () => ProductsAPIService.getProductById(productId)
	})

	useEffect(() => {
		if (result.error) {
			toast.error(result.error?.message ?? 'Failed to get product')
		}
	}, [result.error])

	return result
}
