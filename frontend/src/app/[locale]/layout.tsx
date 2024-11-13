import { Inter } from 'next/font/google'

import type { Metadata } from 'next'

import './globals.scss'
import { Providers, TranslationProvider } from './providers'
import { i18nConfig, initTranslations } from '@/core/config/i18next.config'
import {
	SEO_DESCRIPTION,
	SEO_KEYWORDS,
	SITE_NAME
} from '@/core/constants/seo.constant'
import { cn } from '@/core/lib/tailwind.utils'

const font = Inter({
	subsets: ['cyrillic', 'latin'],
	weight: ['300', '400', '500', '600', '700'],
	display: 'swap',
	variable: '--font-sans',
	style: ['normal']
})

export const metadata: Metadata = {
	title: {
		default: SITE_NAME,
		template: `%s | ${SITE_NAME}`
	},
	description: SEO_DESCRIPTION,
	keywords: SEO_KEYWORDS
}

export function generateStaticParams() {
	return i18nConfig.locales.map(locale => ({ locale }))
}

const i18nNamespaces = ['translation']

export default async function RootLayout({
	children,
	params: { locale }
}: Readonly<{
	children: React.ReactNode
	params: { locale: string }
}>) {
	const { resources } = await initTranslations(locale, i18nNamespaces)

	return (
		<html lang={locale}>
			<head>
				<meta
					name='viewport'
					content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
				/>
			</head>

			<body
				className={cn(
					'relative min-h-screen w-full bg-background font-sans text-text_primary antialiased',
					font.variable
				)}
			>
				<TranslationProvider
					locale={locale}
					resources={resources}
					namespaces={i18nNamespaces}
				>
					<Providers>{children}</Providers>
				</TranslationProvider>
			</body>
		</html>
	)
}
