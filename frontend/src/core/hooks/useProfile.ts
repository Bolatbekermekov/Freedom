import { useQuery } from '@tanstack/react-query'

import { UserService } from '../services/user.service'

export function useProfile() {
	return useQuery({
		queryKey: ['profile'],
		queryFn: () => UserService.getProfile(),
		retry: false
	})
}
