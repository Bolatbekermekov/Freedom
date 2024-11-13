'use client'

import { useRouter } from 'next/navigation'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Home, LogOut } from 'lucide-react'
import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { ADMIN_MENU } from '../../../core/config/menu.config'

import { AdminLocalesChange } from './AdminLocalesChange'
import { useCurrentPage } from '@/core/hooks/useCurrentPage'
import { useProfile } from '@/core/hooks/useProfile'
import { getUserInitials } from '@/core/lib/user.utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/core/ui/avatar'
import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList
} from '@/core/ui/command'
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

export const AdminHeader = memo(() => {
	const { t } = useTranslation()
	const router = useRouter()

	const { data: currentUser, isPending: isCurrentUserLoading } = useProfile()
	const queryClient = useQueryClient()

	const { currentPage, isLoading: isCurrentPageLoading } =
		useCurrentPage(ADMIN_MENU)

	const [openSearch, setOpenSearch] = useState(false)

	const { mutate } = useMutation({
		mutationKey: ['logout'],
		mutationFn: () => AuthService.logout(),
		onSuccess: () => {
			toast.success('Вы вышли из системы')
			AuthTokenService.removeFromStorage(EnumTokens.ACCESS_TOKEN)
			queryClient.resetQueries({ queryKey: ['profile'] })
			router.push('/')
		},
		onError: () => {
			toast.error('Не удалось выйти из системы')
		}
	})

	const onLogoutClick = () => {
		mutate()
	}

	const onHomeClick = () => {
		router.push('/')
	}

	return (
		<nav className='sticky top-4 z-40 mx-6 mt-4 flex flex-row flex-wrap items-center justify-between gap-3 rounded-xl bg-white/10 py-4 backdrop-blur-xl'>
			{isCurrentPageLoading && (
				<div>
					<Skeleton className='h-[16px] w-[110px]' />
					<Skeleton className='mt-2 h-[32px] w-[120px]' />
				</div>
			)}

			{currentPage && (
				<div>
					<p className='text-xs text-[#1b254b]'># / {t(currentPage.name)}</p>
					<h1 className='mt-2 text-2xl font-bold capitalize text-[#1b254b]'>
						{t(currentPage.name)}
					</h1>
				</div>
			)}

			<div className='flex w-full items-center justify-between gap-4 rounded-xl bg-white px-4 py-2 text-text_primary-light sm:w-fit sm:justify-normal'>
				{/* <Sheet>
					<SheetTrigger asChild>
						<button className='block sm:hidden'>
							<Menu className='h-5 w-5' />
						</button>
					</SheetTrigger>
					<SheetContent
						side='left'
						className='bg-white'
					>
						<AdminSidebar currentUser={c} />
					</SheetContent>
				</Sheet>

				<button onClick={() => setOpenSearch(true)}>
					<Search className='h-5 w-5' />
				</button>

				<button>
					<Bell className='h-5 w-5' />
				</button> */}

				<AdminLocalesChange />

				{isCurrentUserLoading && (
					<Skeleton className='h-10 min-w-10  rounded-full' />
				)}

				{currentUser && (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Avatar className='h-10 w-10  cursor-pointer'>
								<AvatarImage alt={currentUser.name} />
								<AvatarFallback>
									{getUserInitials(currentUser.name)}
								</AvatarFallback>
							</Avatar>
						</DropdownMenuTrigger>
						<DropdownMenuContent className='w-56'>
							<DropdownMenuItem onClick={onHomeClick}>
								<Home
									className='mr-2'
									size={16}
								/>
								<span>Главный экран</span>
							</DropdownMenuItem>
							<DropdownMenuItem onClick={onLogoutClick}>
								<LogOut
									className='mr-2'
									size={16}
								/>
								<span>{t('AUTH.LOGOUT.LABEL')}</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				)}

				<CommandDialog
					open={openSearch}
					onOpenChange={setOpenSearch}
				>
					<CommandInput placeholder='Search...' />
					<CommandList>
						<CommandEmpty>No results found.</CommandEmpty>
						<CommandGroup heading='Suggestions'>
							<CommandItem>Dashboard</CommandItem>
							<CommandItem>Orders</CommandItem>
							<CommandItem>Storage</CommandItem>
							<CommandItem>Categories</CommandItem>
							<CommandItem>Profile</CommandItem>
						</CommandGroup>
					</CommandList>
				</CommandDialog>
			</div>
		</nav>
	)
})

AdminHeader.displayName = 'AdminHeader'
