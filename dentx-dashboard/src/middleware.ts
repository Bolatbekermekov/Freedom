import { type NextRequest, NextResponse } from 'next/server'

import { i18nRouter } from 'next-i18n-router'

import { i18nConfig } from './core/config/i18next.config'
import { ROLES } from './core/models/user.model'
import { UserService } from './core/services/user.service'
import { EnumTokens } from './modules/auth/services/auth-token.service'

const permittedRoles = [ROLES.SUPERADMIN, ROLES.ADMIN]

export async function middleware(request: NextRequest) {
	const { url, cookies } = request
	const token = cookies.get(EnumTokens.ACCESS_TOKEN)?.value
	const isAdminPage = url.includes('/admin')

	if (!token) {
		if (isAdminPage) {
			return NextResponse.redirect(new URL('/', request.url))
		}

		return i18nRouter(request, i18nConfig)
	}

	const initialUser = await UserService.getProfile(token)

	if (
		isAdminPage &&
		initialUser &&
		!permittedRoles.includes(initialUser.role)
	) {
		return NextResponse.redirect(new URL('/', request.url))
	}

	return i18nRouter(request, i18nConfig)
}
export const config = {
	matcher: '/((?!api|static|.*\\..*|_next).*)'
}
