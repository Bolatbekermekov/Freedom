import { axiosBase } from '../api/interceptors'
import { IUser } from '../models/user.model'

import { environment } from '@/core/config/environment.config'

class UserServiceClass {
	private readonly baseUrl = `${environment.apiUrl}/api/v2/user`

	async getProfile(token?: string) {
		const options = token
			? {
					headers: {
						Authorization: `Bearer ${token}`,
						Cookie: `token=${token}`
					}
				}
			: undefined

		return axiosBase
			.get<{ user: IUser }>(`${this.baseUrl}/me`, options)
			.then(response => response.data.user)
			.catch(() => {
				return undefined
			})
	}
}

export const UserService = new UserServiceClass()
