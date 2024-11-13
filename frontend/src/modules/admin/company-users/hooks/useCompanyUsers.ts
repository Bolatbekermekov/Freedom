import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { toast } from 'sonner'

import { ICompanyUsersFilter } from '../models/company-users-dto.model'
import { UsersAPIService } from '../services/users-api.service'

import { getPagination } from '@/core/lib/pagination.utils'
import { Pageable } from '@/core/models/paginated.model'

interface UseCompanyUsersProps {
	pagination: Partial<Pageable>
	filter: Partial<ICompanyUsersFilter>
}

export function useCompanyUsers({ pagination, filter }: UseCompanyUsersProps) {
	const result = useQuery({
		queryKey: ['company-users', { ...pagination, ...filter }],
		queryFn: () =>
			UsersAPIService.getCompanyMembers(getPagination(pagination), filter)
	})

	useEffect(() => {
		if (result.error) {
			toast.error(result.error?.message ?? 'Failed to get company users')
		}
	}, [result.error])

	return result
}
