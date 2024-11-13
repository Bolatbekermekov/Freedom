import {
	Pageable,
	PaginatedResult
} from '../../../../core/models/paginated.model'
import {
	CreateCategoryDTO,
	ICategoryFilter,
	UpdateCategoryDTO
} from '../models/category-dto.model'
import { ICategories } from '../models/category.model'

import { axiosWithAuth } from '@/core/api/interceptors'
import { environment } from '@/core/config/environment.config'

class AdminCategoriesAPIClass {
	baseUrl = `${environment.apiUrl}/api/v2/admin/categories`

	async getCategories(
		pageable: Pageable,
		filter: ICategoryFilter
	): Promise<PaginatedResult<ICategories[]>> {
		const params = {
			...pageable,
			...filter
		}

		return axiosWithAuth
			.get(`${this.baseUrl}`, { params: params })
			.then(res => res.data)
	}

	async getCategory(id: string): Promise<ICategories> {
		return axiosWithAuth.get(`${this.baseUrl}/${id}`).then(res => res.data)
	}

	async createCategory(dto: CreateCategoryDTO) {
		const formData = new FormData()

		Object.entries(dto).forEach(([key, value]) => {
			if (value) {
				formData.append(key, value)
			}
		})

		return axiosWithAuth.post(`${this.baseUrl}`, formData, {
			headers: {
				'Content-Type': 'multipart/form-data'
			}
		})
	}

	async updateCategory(id: string, dto: UpdateCategoryDTO) {
		const formData = new FormData()

		Object.entries(dto).forEach(([key, value]) => {
			if (value) {
				formData.append(key, value)
			}
		})

		return axiosWithAuth.put(`${this.baseUrl}/${id}`, dto)
	}
}

export const adminCategoriesAPIService = new AdminCategoriesAPIClass()
