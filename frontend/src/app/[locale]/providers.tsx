'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { createInstance } from 'i18next'
import NextTopLoader from 'nextjs-toploader'
import { PropsWithChildren, memo, useState } from 'react'
import { I18nextProvider } from 'react-i18next'
import { Toaster } from 'sonner'

import { initTranslations } from '@/core/config/i18next.config'
import { queryClientConfig } from '@/core/config/query-client.config'

export function Providers({ children }: Readonly<PropsWithChildren>) {
	const [queryClient] = useState(() => new QueryClient(queryClientConfig))

	return (
		<QueryClientProvider client={queryClient}>
			<NextTopLoader
				color='#7352FF'
				initialPosition={0.08}
				crawlSpeed={200}
				height={4}
				crawl={true}
				showSpinner={false}
				easing='ease'
				speed={200}
			/>

			{children}

			<ReactQueryDevtools initialIsOpen={false} />
			<Toaster
				position='top-center'
				duration={3000}
				expand={true}
				richColors
			></Toaster>
		</QueryClientProvider>
	)
}

interface TranslationProviderProps {
	locale: string
	namespaces: string[]
	resources: any
}

export const TranslationProvider = memo<
	PropsWithChildren<TranslationProviderProps>
>(({ children, locale, namespaces, resources }) => {
	const i18n = createInstance()

	initTranslations(locale, namespaces, i18n, resources)

	return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
})

TranslationProvider.displayName = 'TranslationProvider'
