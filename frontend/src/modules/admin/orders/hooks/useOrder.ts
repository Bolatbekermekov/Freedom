import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { toast } from 'sonner'

import { adminOrdersAPIService } from '../services/orders-api.service'

export function useAdminOrder(orderId: string) {
	const result = useQuery({
		queryKey: ['admin-order', orderId],
		queryFn: () => adminOrdersAPIService.getOrder(orderId)
	})

	useEffect(() => {
		if (result.error) {
			toast.error('Ошибка при загрузке заказа')
		}
	}, [result.error])

	return result
}
