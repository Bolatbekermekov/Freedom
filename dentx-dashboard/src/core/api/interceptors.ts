import axios, { type CreateAxiosDefaults } from 'axios'

import { environment } from '@/core/config/environment.config'
import { AuthTokenService } from '@/modules/auth/services/auth-token.service'

const options: CreateAxiosDefaults = {
	baseURL: environment.apiUrl,
	headers: {
		'Content-Type': 'application/json',
		'Access-Control-Allow-Credentials': true
	},
	withCredentials: true
}

const axiosBase = axios.create(options)
const axiosWithAuth = axios.create(options)

axiosWithAuth.interceptors.request.use(config => {
	const accessToken = AuthTokenService.getAccessToken()

	if (config.headers && accessToken) {
		config.headers.Authorization = `Bearer ${accessToken}`
	}

	return config
})

// TODO: REFACTOR
// axiosWithAuth.interceptors.response.use(
// 	config => config,
// 	async error => {
// 		const originalRequest = error.config
// 		if (
// 			(error?.response?.status === 401 ||
// 				errorCatch(error) === 'Token expired' ||
// 				errorCatch(error) === 'Token must be provided') &&
// 			error.config &&
// 			!error.config._isRetry
// 		) {
// 			originalRequest.__isRetry = true

// 			try {
// 				await AuthTokenService.getNewTokens()
// 				return axiosWithAuth.request(originalRequest)
// 			} catch (error) {
// 				if (errorCatch(error) === 'Token expired')
// 					AuthTokenService.removeFromStorage(EnumTokens.ACCESS_TOKEN)
// 			}
// 		}

// 		throw error
// 	}
// )

export { axiosBase, axiosWithAuth }
