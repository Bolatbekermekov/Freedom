import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { toast } from 'sonner'

import { UsersFilterDTO } from '../models/users-dto.model'
import { UsersAPIService } from '../services/users-api.service'

import { getPagination } from '@/core/lib/pagination.utils'
import { Pageable } from '@/core/models/paginated.model'

interface UseUsersProps {
	pagination: Partial<Pageable>
	filter: Partial<UsersFilterDTO>
}

export function useAdminUsers({ pagination, filter }: UseUsersProps) {
	const result = useQuery({
		queryKey: ['users', { ...pagination, ...filter }],
		queryFn: () =>
			UsersAPIService.getAllUsers(getPagination(pagination), filter)
	})

	useEffect(() => {
		if (result.error) {
			toast.error(result.error?.message ?? 'Failed to get users')
		}
	}, [result.error])

	return result
}
