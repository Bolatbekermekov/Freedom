import { AuthResponseDTO, LoginDTO, SignupDTO } from '../models/auth.model'

import { axiosBase } from '@/core/api/interceptors'
import { environment } from '@/core/config/environment.config'

class AuthServiceClass {
	private readonly baseUrl = `${environment.apiUrl}/api/v2/user`

	async login(dto: LoginDTO) {
		return axiosBase
			.post<AuthResponseDTO>(`${this.baseUrl}/login`, dto)
			.then(res => res.data)
	}

	async logout() {
		return axiosBase.get<AuthResponseDTO>(`${this.baseUrl}/logout`)
	}

	async signup(dto: SignupDTO) {
		return axiosBase
			.post<AuthResponseDTO>(`${this.baseUrl}/new`, dto)
			.then(res => res.data)
	}
}

export const AuthService = new AuthServiceClass()
