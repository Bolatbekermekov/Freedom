import { cookies } from 'next/headers'

import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { type PropsWithChildren } from 'react'

import { getQueryClient } from '@/core/config/query-client.config'
import { UserService } from '@/core/services/user.service'
import { AdminHeader } from '@/modules/admin/components/AdminHeader'
import { AdminSidebar } from '@/modules/admin/components/AdminSidebar'

export default async function Layout({ children }: PropsWithChildren) {
	const queryClient = getQueryClient()
	const cookieStore = cookies()
	const token = cookieStore.get('token')?.value

	const initialUser = await UserService.getProfile(token)

	queryClient.prefetchQuery({
		queryKey: ['profile'],
		queryFn: () => UserService.getProfile(token)
	})

	return (
		<div className='flex h-screen w-full bg-[#F4F7FE]'>
			<div className='hidden w-fit bg-white p-9 sm:block'>
				{initialUser && <AdminSidebar currentUser={initialUser} />}
			</div>

			<HydrationBoundary state={dehydrate(queryClient)}>
				<main className='relative h-full w-full overflow-y-auto'>
					<AdminHeader />

					<div className='p-6'>{children}</div>
				</main>
			</HydrationBoundary>
		</div>
	)
}
