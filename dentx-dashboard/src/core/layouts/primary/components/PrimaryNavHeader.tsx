'use client'

import Link from 'next/link'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { LogOut, Store, User } from 'lucide-react'
import { toast } from 'sonner'

import { PrimaryCatalogsDropdown } from './PrimaryCatalogsDropdown'
import { PrimaryLocalesChange } from './PrimaryLocalesChange'
import { PrimarySearchBar } from './PrimarySearchBar'
import { ADMIN_PAGES, AUTH_PAGES } from '@/core/config/pages-url.config'
import { useProfile } from '@/core/hooks/useProfile'
import { getFirstName } from '@/core/lib/user.utils'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '@/core/ui/dropdown-menu'
import { Skeleton } from '@/core/ui/skeleton'
import {
	AuthTokenService,
	EnumTokens
} from '@/modules/auth/services/auth-token.service'
import { AuthService } from '@/modules/auth/services/auth.service'

export const PrimaryNavHeader = () => {
	const { data: currentUser, isPending: isCurrentUserLoading } = useProfile()
	const queryClient = useQueryClient()

	const { mutate } = useMutation({
		mutationKey: ['logout'],
		mutationFn: () => AuthService.logout(),
		onSuccess: () => {
			toast.success('Вы вышли из системы')
			AuthTokenService.removeFromStorage(EnumTokens.ACCESS_TOKEN)
			queryClient.resetQueries({ queryKey: ['profile'] })
		},
		onError: () => {
			toast.error('Не удалось выйти из системы')
		}
	})

	const onLogoutClick = () => {
		mutate()
	}

	return (
		<header className='flex items-center justify-between gap-6 rounded-md bg-white'>
			<Link
				href={'/'}
				prefetch
				className='hidden md:block'
			>
				<p className='text-4xl font-bold text-primary'>DentX</p>
			</Link>

			<div className='hidden md:block'>
				<PrimaryCatalogsDropdown />
			</div>

			<PrimarySearchBar />

			<div>
				<PrimaryLocalesChange />
			</div>

			<div>
				{isCurrentUserLoading && (
					<Skeleton className='h-10 w-10 rounded-full' />
				)}

				{!currentUser && !isCurrentUserLoading && (
					<Link
						prefetch
						href={AUTH_PAGES.LOGIN}
						className='flex h-full w-full cursor-pointer items-center gap-1 hover:text-primary'
					>
						<User size={18} />
						<p>Войти</p>
					</Link>
				)}

				{currentUser && (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<div className='flex cursor-pointer items-center gap-3 rounded-lg bg-slate-100 px-4 py-3 hover:text-primary'>
								<User size={18} />
								<p>{getFirstName(currentUser.name)}</p>
							</div>
						</DropdownMenuTrigger>
						<DropdownMenuContent className='spacing-y-2 w-56'>
							{currentUser.company && (
								<DropdownMenuItem className='h-full w-full'>
									<Link
										href={ADMIN_PAGES.DASHBOARD}
										prefetch
										className='flex h-full w-full items-center'
									>
										<Store
											className='mr-2'
											size={16}
										/>
										<span>Админ Панель</span>
									</Link>
								</DropdownMenuItem>
							)}

							<DropdownMenuItem onClick={onLogoutClick}>
								<LogOut
									className='mr-2'
									size={16}
								/>
								<span>Выйти</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				)}
			</div>
		</header>
	)
}
