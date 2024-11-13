import {
	type NextFetchEvent,
	type NextRequest,
	NextResponse
} from 'next/server'

import { CustomMiddleware } from './compose-middlewares'
import { AUTH_PAGES } from '@/core/config/pages-url.config'
import { EnumTokens } from '@/modules/auth/services/auth-token.service'

export function authMiddleware(middleware: CustomMiddleware) {
	return async (request: NextRequest, event: NextFetchEvent) => {
		let response = NextResponse.next()

		const { url, cookies } = request

		const token = cookies.get(EnumTokens.ACCESS_TOKEN)?.value
		const isDashboardPage = url.includes('/admin')

		if (!token && isDashboardPage) {
			response = NextResponse.redirect(new URL(AUTH_PAGES.LOGIN, url))
			return middleware(request, event, response)
		}

		return middleware(request, event, response)
	}
}
