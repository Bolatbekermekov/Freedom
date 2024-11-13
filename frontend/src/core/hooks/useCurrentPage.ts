import { usePathname } from 'next/navigation'

import { useCallback, useEffect, useState } from 'react'

import { i18nConfig } from '../config/i18next.config'

import { IMenuItem } from '@/core/config/menu.config'

export function useCurrentPage(pages: IMenuItem[]) {
	const pathname = usePathname()

	const [isLoading, setIsLoading] = useState<boolean>(true)
	const [currentPage, setCurrentPage] = useState<IMenuItem | null>(null)

	const handlePageUpdate = useCallback(
		(pathnameValue: string) => {
			const normalizedPathname = i18nConfig.locales.some(locale =>
				pathnameValue.startsWith(`/${locale}`)
			)
				? pathnameValue.slice(3)
				: pathnameValue

			const matchingPage = Object.entries(pages).find(([, page]) => {
				return page.link() === normalizedPathname
			})

			setCurrentPage(matchingPage?.[1] ?? null)
		},
		[pages]
	)

	useEffect(() => {
		setIsLoading(true)
		handlePageUpdate(pathname)
		setIsLoading(false)
	}, [handlePageUpdate, pathname])

	return { currentPage, isLoading }
}
