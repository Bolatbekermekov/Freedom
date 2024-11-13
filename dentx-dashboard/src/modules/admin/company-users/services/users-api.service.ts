import {
	Pageable,
	PaginatedResult
} from '../../../../core/models/paginated.model'
import {
	AddCompanyUserDTO,
	ICompanyUsersFilter
} from '../models/company-users-dto.model'
import { CreateUserDTO, UsersFilterDTO } from '../models/users-dto.model'

import { axiosWithAuth } from '@/core/api/interceptors'
import { environment } from '@/core/config/environment.config'
import { IUser } from '@/core/models/user.model'

class UsersAPIClass {
	baseUrl = `${environment.apiUrl}/api/v2/admin/users`

	async getCompanyMembers(
		pageable: Pageable,
		filter: ICompanyUsersFilter
	): Promise<PaginatedResult<IUser[]>> {
		const params = {
			...pageable,
			...filter
		}

		return axiosWithAuth
			.get(`${this.baseUrl}/company`, { params: params })
			.then(res => res.data)
	}

	async addCompanyMember(dto: AddCompanyUserDTO) {
		return axiosWithAuth.post(`${this.baseUrl}/company`, dto)
	}

	async getAllUsers(
		pageable: Pageable,
		filter: UsersFilterDTO
	): Promise<PaginatedResult<IUser[]>> {
		const params = {
			...pageable,
			...filter
		}

		return axiosWithAuth
			.get(`${this.baseUrl}`, { params: params })
			.then(res => res.data)
	}

	async createUser(dto: CreateUserDTO) {
		return axiosWithAuth.post(`${this.baseUrl}`, dto)
	}
}

export const UsersAPIService = new UsersAPIClass()
