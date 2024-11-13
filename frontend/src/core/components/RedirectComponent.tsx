'use client'

import { RedirectType, redirect, usePathname } from 'next/navigation'

interface RedirectComponentProps {
	url?: string
}

export function RedirectComponent({ url = '/' }: RedirectComponentProps) {
	const pathname = usePathname()
	redirect(`${url}?redirect=` + pathname, RedirectType.replace)

	return <></>
}
