import { cookies } from 'next/headers'
import Link from 'next/link'

import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { Home, ShoppingCart, TextSearch, User } from 'lucide-react'
import { PropsWithChildren } from 'react'

import PrimaryDetailsHeader from './components/PrimaryDetailsHeader'
import { PrimaryNavHeader } from './components/PrimaryNavHeader'
import { ADMIN_PAGES, AUTH_PAGES } from '@/core/config/pages-url.config'
import { getQueryClient } from '@/core/config/query-client.config'
import { UserService } from '@/core/services/user.service'

interface PrimaryLayoutProps extends PropsWithChildren {}

export default async function PrimaryLayout({ children }: PrimaryLayoutProps) {
	const queryClient = getQueryClient()
	const cookieStore = cookies()
	const token = cookieStore.get('token')?.value

	const currentUser = await UserService.getProfile(token)

	queryClient.prefetchQuery({
		queryKey: ['profile'],
		queryFn: () => UserService.getProfile(token)
	})

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<div className='relative min-h-screen w-full bg-white pb-20 text-sm'>
				<main className='container'>
					<div className='hidden px-4 pt-2 sm:block'>
						<PrimaryDetailsHeader />
					</div>
					<div className='sticky top-0 z-10 border-b border-slate-200 bg-white px-4 py-2 sm:mt-3 sm:border-none sm:py-3'>
						<PrimaryNavHeader />
					</div>

					{children}
				</main>

				<div className='fixed bottom-0 left-0 right-0 hidden items-center justify-center gap-16 border-t border-slate-200 bg-white px-4 py-3 pb-6 sm:gap-20'>
					<Link
						href='/'
						className='text-slate-400'
					>
						<Home size={24} />
					</Link>

					<Link
						href='/search'
						className='text-slate-400'
					>
						<TextSearch size={24} />
					</Link>

					<Link
						href='/cart'
						className='text-slate-400'
					>
						<ShoppingCart size={24} />
					</Link>

					<Link
						href={currentUser ? ADMIN_PAGES.DASHBOARD : AUTH_PAGES.LOGIN}
						className='text-slate-400'
					>
						<User size={24} />
					</Link>
				</div>
			</div>
		</HydrationBoundary>
	)
}
