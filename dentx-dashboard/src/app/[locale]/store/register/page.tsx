import { cookies } from 'next/headers'

import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { Metadata } from 'next'

import { getQueryClient } from '@/core/config/query-client.config'
import { UserService } from '@/core/services/user.service'
import { RegisterStorePage } from '@/modules/store/pages/RegisterStore'

export const metadata: Metadata = {
	title: 'Регистрация Магазина'
}

export default async function Page() {
	const queryClient = getQueryClient()
	const cookieStore = cookies()
	const token = cookieStore.get('token') || cookieStore.get('access_token')

	queryClient.prefetchQuery({
		queryKey: ['profile'],
		queryFn: () => UserService.getProfile(token?.value)
	})

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<RegisterStorePage />
		</HydrationBoundary>
	)
}
