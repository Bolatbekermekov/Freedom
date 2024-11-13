import { usePathname, useRouter } from 'next/navigation'

import { memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { LOCALES, i18nConfig } from '@/core/config/i18next.config'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/core/ui/select'

export const PrimaryLocalesChange = memo(() => {
	const { i18n } = useTranslation()
	const router = useRouter()
	const currentPathname = usePathname()

	const currentLocale = i18n.language
	const defaultLocale = i18nConfig.defaultLocale

	const handleChange = useCallback(
		(newLocale: string) => {
			const days = 30
			const date = new Date()
			date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
			const expires = '; expires=' + date.toUTCString()
			document.cookie = `NEXT_LOCALE=${newLocale};expires=${expires};path=/`

			if (currentLocale === defaultLocale) {
				router.push('/' + newLocale + currentPathname)
			} else {
				router.push(
					currentPathname.replace(`/${currentLocale}`, `/${newLocale}`)
				)
			}

			router.refresh()
		},
		[currentLocale, currentPathname, defaultLocale, router]
	)

	return (
		<Select
			onValueChange={v => handleChange(v)}
			defaultValue={currentLocale}
		>
			<SelectTrigger className='border-none bg-transparent p-0'>
				<SelectValue placeholder='Lang' />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value={LOCALES.RU}>Русский</SelectItem>
				<SelectItem value={LOCALES.KZ}>Қазақ тілі</SelectItem>
				<SelectItem value={LOCALES.EN}>English</SelectItem>
			</SelectContent>
		</Select>
	)
})

PrimaryLocalesChange.displayName = 'PrimaryLocalesChange'
