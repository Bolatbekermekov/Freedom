'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { i18nConfig } from '@/core/config/i18next.config'
import { cn } from '@/core/lib/tailwind.utils'

interface AdminSidebarMenuItemProps {
	link: string
	name: string
	icon: React.ReactNode
}

export const AdminSidebarMenuItem = memo(
	(item: Readonly<AdminSidebarMenuItemProps>) => {
		const { t } = useTranslation()
		const pathname = usePathname()

		const isActive = useMemo(
			() =>
				i18nConfig.locales.some(locale => pathname.startsWith(`/${locale}`))
					? pathname.slice(3) === item.link
					: pathname === item.link,
			[item.link, pathname]
		)

		return (
			<div>
				<Link
					href={`${item.link}`}
					prefetch
					className={cn(
						'flex cursor-pointer items-center gap-4 truncate py-1.5 transition-colors',
						{
							'text-primary': isActive
						}
					)}
				>
					{item.icon}
					<span className='text-base'>{t(item.name)}</span>
				</Link>
			</div>
		)
	}
)

AdminSidebarMenuItem.displayName = 'AdminSidebarMenuItem'
