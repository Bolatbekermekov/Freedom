import Cookies from 'js-cookie'

export enum EnumTokens {
	ACCESS_TOKEN = 'token',
	REFRESH_TOKEN = 'refresh_token'
}

class AuthTokenServiceClass {
	getAccessToken() {
		const accessToken =
			Cookies.get(EnumTokens.ACCESS_TOKEN) ||
			localStorage.getItem(EnumTokens.ACCESS_TOKEN)

		return accessToken ?? null
	}

	saveTokenStorage(accessToken: string) {
		Cookies.set(EnumTokens.ACCESS_TOKEN, accessToken, {
			sameSite: 'none',
			secure: true,
			expires: 7
		})

		localStorage.setItem(EnumTokens.ACCESS_TOKEN, accessToken)
	}

	removeFromStorage(token: EnumTokens) {
		Cookies.remove(token)
		localStorage.removeItem(token)
	}

	async getNewTokens() {}
}

export const AuthTokenService = new AuthTokenServiceClass()
