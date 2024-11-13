import { HelpContactDTO } from '../models/help-dto.model'

import { axiosBase } from '@/core/api/interceptors'
import { environment } from '@/core/config/environment.config'

class HelpAPIServiceClass {
	private readonly baseUrl = `${environment.apiUrl}/api/v2/user`

	async sendContactForm(dto: HelpContactDTO) {
		return axiosBase.post<void>(`${this.baseUrl}/submitmessage`, dto)
	}
}

export const helpApiService = new HelpAPIServiceClass()
