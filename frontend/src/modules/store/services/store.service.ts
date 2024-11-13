import {
	CompanyDTO,
	RegisterStoreDTO,
	UpdateCompanyDTO
} from '../models/store-dto.model'

import { axiosBase, axiosWithAuth } from '@/core/api/interceptors'
import { environment } from '@/core/config/environment.config'

class CompaniesServiceClass {
	private readonly baseUrl = `${environment.apiUrl}/api/v2/companies`

	async registerStore(dto: RegisterStoreDTO) {
		return axiosBase.post<void>(`${this.baseUrl}`, dto)
	}

	async getCompany(id: string) {
		return axiosBase
			.get<CompanyDTO>(`${this.baseUrl}/${id}`)
			.then(resp => resp.data)
	}

	async getStores() {
		return axiosBase
			.get<CompanyDTO[]>(`${this.baseUrl}/stores`)
			.then(resp => resp.data)
	}

	async getCurrentUserCompany() {
		return axiosWithAuth
			.get<CompanyDTO>(`${this.baseUrl}/current`)
			.then(resp => resp.data)
	}

	async updateCompany(dto: UpdateCompanyDTO) {
		return axiosWithAuth
			.put<void>(`${this.baseUrl}/current`, dto)
			.then(resp => resp.data)
	}
}

export const companiesService = new CompaniesServiceClass()
