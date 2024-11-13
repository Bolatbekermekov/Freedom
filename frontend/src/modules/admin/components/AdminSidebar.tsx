import Link from 'next/link'

import { LayoutDashboard } from 'lucide-react'
import React, { memo, useMemo } from 'react'

import { ADMIN_MENU } from '../../../core/config/menu.config'

import { AdminSidebarMenuItem } from './AdminSidebarMenuItem'
import { IUser } from '@/core/models/user.model'

interface AdminSidebarProps {
	currentUser: IUser
}

export const AdminSidebar = memo(({ currentUser }: AdminSidebarProps) => {
	const sidebarLinks = useMemo(() => {
		return ADMIN_MENU.filter(v => v.showRoles?.includes(currentUser.role)).map(
			item => (
				<AdminSidebarMenuItem
					link={item.link()}
					name={item.name}
					icon={React.createElement(item.icon ?? LayoutDashboard, {
						className: 'w-5 h-5'
					})}
					key={item.link()}
				/>
			)
		)
	}, [currentUser])

	return (
		<aside className='min-h-full'>
			<Link
				prefetch
				href={'/'}
			>
				<p className='text-3xl font-bold text-primary'>Freedom</p>
			</Link>

			{currentUser && (
				<nav className='mt-8 flex flex-col gap-2'>{sidebarLinks}</nav>
			)}
		</aside>
	)
})

AdminSidebar.displayName = 'AdminSidebar'
