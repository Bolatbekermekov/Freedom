import { type NextFetchEvent, type NextRequest } from 'next/server'

import { i18nRouter } from 'next-i18n-router'

import { CustomMiddleware } from './compose-middlewares'
import { i18nConfig } from '@/core/config/i18next.config'

export function localeMiddleware(middleware: CustomMiddleware) {
	return async (request: NextRequest, event: NextFetchEvent) => {
		const response = i18nRouter(request, i18nConfig)

		return middleware(request, event, response)
	}
}
